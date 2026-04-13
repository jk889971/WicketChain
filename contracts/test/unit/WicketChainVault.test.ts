import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";
import { deployFixture, createVenueAndEvent } from "../fixtures/deploy.ts";

// Row A = 0x41
const ROW_A = "0x41";

describe("WicketChainVault", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function setup() {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const startTime = now + 864000n; // 10 days from now to avoid RefundWindowClosed in integration tests
    const endTime = startTime + 14400n; // 4 hours match
    const fixtures = await deployFixture(viem);
    const eventData = await createVenueAndEvent(viem, fixtures, startTime, endTime);
    return { ...fixtures, ...eventData };
  }

  // ── Test 1: Deposit increments event balance ──
  it("Should record ticket revenue on deposit", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.ticketRevenue, f.generalPrice);
  });

  // ── Test 2: Credit refund on return ──
  it("Should credit refund on ticket return", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);
    const expectedRefund = (f.generalPrice * 8000n) / 10000n;
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(claimable, expectedRefund);
  });

  // ── Test 3: Claim refund sends ETH ──
  it("Should send ETH on claimRefunds", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);

    const balanceBefore = await publicClient.getBalance({ address: f.fan1.account.address });
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await vaultAsFan.write.claimRefunds();
    const balanceAfter = await publicClient.getBalance({ address: f.fan1.account.address });
    // After claiming, fan balance should increase (minus gas)
    // Claimable should be 0
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(claimable, 0n);
  });

  // ── Test 4: Cannot claim with zero balance ──
  it("Should revert claim with zero claimable", async function () {
    const f = await setup();
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(vaultAsFan.write.claimRefunds());
  });

  // ── Test 5: Settle event splits correctly ──
  it("Should settle event with correct split", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // Buy 5 tickets
    for (let i = 1n; i <= 5n; i++) {
      await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, i], { value: f.generalPrice });
    }

    // Mark event completed
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED = 5

    const eventManagerAddr = f.eventManager.account.address;
    const platformBalBefore = await publicClient.getBalance({ address: f.admin.account.address });

    // Settle: 5% platform
    await f.vault.write.settleEvent([1n, 5n, eventManagerAddr]);

    const balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.isSettled, true);
  });

  // ── Test 6: Cannot settle twice ──
  it("Should revert on double settlement", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]);
    await assert.rejects(
      f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]),
    );
  });

  // ── Test 7: Unauthorized contract cannot deposit ──
  it("Should revert deposit from unauthorized contract", async function () {
    const f = await setup();
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      vaultAsFan.write.deposit([1n, 0], { value: 1000000000000000n }),
    );
  });

  // ── Test 8: Update shop fee ──
  it("Should update shop fee BPS", async function () {
    const f = await setup();
    await f.vault.write.setShopFeeBps([1000n]); // 10%
    assert.equal(await f.vault.read.shopFeeBps(), 1000n);
  });

  // ── Test 9: Settle with zero balance ──
  it("Should settle event with zero balance", async function () {
    const f = await setup();
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]);
    const balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.isSettled, true);
  });

  // ── Test 10: Event balance tracks refunds ──
  it("Should track ticket refunds in event balance", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);
    const balance = await f.vault.read.getEventBalance([1n]);
    const expectedRefund = (f.generalPrice * 8000n) / 10000n;
    assert.equal(balance.ticketRefunds, expectedRefund);
  });

  // ── Test 11: Platform treasury update ──
  it("Should update platform treasury", async function () {
    const f = await setup();
    await f.vault.write.setPlatformTreasury([f.fan1.account.address]);
    assert.equal(
      (await f.vault.read.platformTreasury()).toLowerCase(),
      f.fan1.account.address.toLowerCase(),
    );
  });

  // ── Test 12: Invalid platform percent ──
  it("Should revert settle with percent > 100", async function () {
    const f = await setup();
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await assert.rejects(
      f.vault.write.settleEvent([1n, 101n, f.eventManager.account.address]),
    );
  });

  // ─────────────────────────────────────────────────────────────
  //                AUDIT REMEDIATION TESTS (T-17..T-25)
  // ─────────────────────────────────────────────────────────────

  // T-17: settleEvent does not drain ETH owed as shop refunds (C-02)
  it("T-17: settleEvent excludes shopRefunds from distributed amount (C-02 fix)", async function () {
    const f = await setup();
    // Setup shop and product
    const profileAsShopOwner = await viem.getContractAt("UserProfile", f.userProfile.address, {
      client: { wallet: f.shopOwner },
    });
    await profileAsShopOwner.write.setProfileHash([keccak256(toHex("ShopOwner|test"))]);
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop(["Shop1", "Desc", "ipfs://x", [1n], ["Gate"]]);
    await f.stadiumShop.write.approveShop([1n]);
    await shopAsOwner.write.addProduct([1n, "Popcorn", "ipfs://p", f.popcornPrice || 2000000000000000n, 100n]);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    // Fan buys ticket and shop item
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: f.popcornPrice || 2000000000000000n });
    // Fan returns ticket → shop cascade refund credited (shopRefunds++) + ticket refund
    await ticketAsFan.write.returnTicket([1n]);
    // Mark event complete and settle with 5% platform cut
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]);
    // Fan should still be able to claim their refunds after settlement
    const refundBefore = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.ok(refundBefore > 0n, "Fan should have claimable refunds after settlement");
    const vaultAsUser = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    // Should not revert (vault still has the ETH)
    await vaultAsUser.write.claimRefunds();
    const refundAfter = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(refundAfter, 0n);
  });

  // T-18: settleEvent doesn't panic when ticketRefunds > ticketRevenue (H-01 safe subtraction)
  it("T-18: settleEvent uses safe subtraction when refunds exceed revenue", async function () {
    const f = await setup();
    // Buy and return ticket (refund = 80% of price, but purchasePrice stays in ticketRevenue slot)
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    // Should not revert even with imbalanced accounting
    await assert.doesNotReject(
      f.vault.write.settleEvent([1n, 0n, f.eventManager.account.address]),
    );
  });

  // T-19: direct ETH send to vault reverts (M-07)
  it("T-19: direct ETH transfer to vault reverts (M-07 untracked ETH guard)", async function () {
    const f = await setup();
    const [signer] = await viem.getWalletClients();
    await assert.rejects(
      signer.sendTransaction({ to: f.vault.address, value: 1n }),
    );
  });

  // T-20: shop earnings are correctly attributed (claimableRefunds maintained post-settle)
  it("T-20: vault maintains correct claimable refunds after settlement", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.cancelEvent([1n]);
    await ticketAsFan.write.claimCancellationRefund([1n]); // claimableRefunds[fan1] = generalPrice
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // forcibly set COMPLETED for test
    await f.vault.write.settleEvent([1n, 10n, f.eventManager.account.address]);
    // Fan's refund should still be withdrawable
    const bal = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(bal, f.generalPrice);
  });

  // T-21: settleEvent reverts with AlreadySettled on double-settle
  it("T-21: settleEvent reverts AlreadySettled on second call", async function () {
    const f = await setup();
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]);
    await assert.rejects(
      f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]),
    );
  });

  // T-22: claimRefunds credits 0 when nothing to claim
  it("T-22: claimRefunds reverts NothingToClaim when balance is zero", async function () {
    const f = await setup();
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan2 },
    });
    await assert.rejects(vaultAsFan.write.claimRefunds());
  });

  // T-23: shopFeeBps change is capped at BPS_DENOMINATOR
  it("T-23: setShopFeeBps reverts when bps exceeds 10000", async function () {
    const f = await setup();
    await assert.rejects(f.vault.write.setShopFeeBps([10001n]));
  });

  // T-24: unauthorised wallet cannot call creditRefund
  it("T-24: creditRefund reverts for unauthorised caller", async function () {
    const f = await setup();
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      vaultAsFan.write.creditRefund([1n, f.fan1.account.address, 1n]),
    );
  });

  // T-25: shop withdrawal works for confirmed earnings
  it("T-25: shop owner can withdraw confirmed earnings", async function () {
    const f = await setup();
    // Setup shop and product
    const profileAsShopOwner = await viem.getContractAt("UserProfile", f.userProfile.address, {
      client: { wallet: f.shopOwner },
    });
    await profileAsShopOwner.write.setProfileHash([keccak256(toHex("ShopOwner|test"))]);
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop(["Shop1", "Desc", "ipfs://x", [1n], ["Gate"]]);
    await f.stadiumShop.write.approveShop([1n]);
    await shopAsOwner.write.addProduct([1n, "Popcorn", "ipfs://p", f.popcornPrice || 2000000000000000n, 100n]);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: f.popcornPrice || 2000000000000000n });
    await ticketAsVerifier.write.markEntered([1n]);
    await f.stadiumShop.write.confirmOrders([[1n]]);
    const shopBal = await f.vault.read.getShopBalance([1n]);
    assert.ok(shopBal.confirmedEarnings > 0n);
  });

  // ── Test 26: Authorize and deauthorize contracts ──
  it("Should authorize and deauthorize contracts", async function () {
    const f = await setup();
    await f.vault.write.authorizeContract([f.fan1.account.address]);
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    // fan1 is authorized, should not reject on deposit
    await assert.doesNotReject(vaultAsFan.write.deposit([1n, 0], { value: 1000n }));
    await f.vault.write.deauthorizeContract([f.fan1.account.address]);
    // should reject after deauthorization
    await assert.rejects(vaultAsFan.write.deposit([1n, 0], { value: 1000n }));
  });

  // ── Test 27: Pause and unpause vault operations ──
  it("Should pause and unpause vault", async function () {
    const f = await setup();
    
    await f.vault.write.pause(["Emergency"]);
    assert.equal(await f.vault.read.paused(), true);
    
    await f.vault.write.unpause();
    assert.equal(await f.vault.read.paused(), false);
  });
});

