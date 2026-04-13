import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";
import { deployFixture, createVenueAndEvent } from "../fixtures/deploy.ts";

// Row A = 0x41, Row D = 0x44
const ROW_A = "0x41";
const ROW_D = "0x44";

describe("Integration: Full Ticket → Shop → Cascade → Settlement Flow", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function fullSetup() {
    const fixtures = await deployFixture(viem);
    const eventData = await createVenueAndEvent(viem, fixtures);

    // Set up shop owner profile
    const profileAsShopOwner = await viem.getContractAt("UserProfile", fixtures.userProfile.address, {
      client: { wallet: fixtures.shopOwner },
    });
    await profileAsShopOwner.write.setProfileHash([keccak256(toHex("ShopOwner|test@test.com|123"))]);

    // Register + approve shop
    const shopAsOwner = await viem.getContractAt("StadiumShop", fixtures.stadiumShop.address, {
      client: { wallet: fixtures.shopOwner },
    });
    await shopAsOwner.write.registerShop(["Food Stand", "Desc", "ipfs://x", [1n], ["Gate 1"]]);
    await fixtures.stadiumShop.write.approveShop([1n]);

    // Add products
    const popcornPrice = 2000000000000000n; // 0.002 ETH
    const pepsiPrice = 1000000000000000n; // 0.001 ETH
    await shopAsOwner.write.addProduct([1n, "Popcorn", "ipfs://p", popcornPrice, 100n]);
    await shopAsOwner.write.addProduct([1n, "Pepsi", "ipfs://d", pepsiPrice, 200n]);

    return { ...fixtures, ...eventData, shopAsOwner, popcornPrice, pepsiPrice };
  }

  // ── Scenario 1: Full flow: buy tickets → buy cart → return → cascade → settle ──
  it("Should execute full lifecycle: buy 3 tickets, cart, return 1, cascade, settle", async function () {
    const f = await fullSetup();

    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan1 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });

    // 1. Buy 3 tickets (bulk) — all Row A, seats 1-3
    const bulkPrice = f.generalPrice * 3n;
    await ticketAsFan1.write.purchaseMultipleTickets([1n, 1n, [ROW_A, ROW_A, ROW_A], [1n, 2n, 3n]], { value: bulkPrice });

    // 2. Set delegate on ticket #2
    await ticketAsFan1.write.setDelegate([2n, f.fan2.account.address]);
    assert.equal(
      (await f.ticketNFT.read.getDelegate([2n])).toLowerCase(),
      f.fan2.account.address.toLowerCase(),
    );

    // 3. Buy cart items split across tickets
    const cartTotal = f.popcornPrice * 2n + f.popcornPrice + f.pepsiPrice;
    await shopAsFan1.write.purchaseCart([
      [
        { productId: 1n, ticketTokenId: 1n, quantity: 2n }, // 2 popcorn → ticket 1
        { productId: 1n, ticketTokenId: 2n, quantity: 1n }, // 1 popcorn → ticket 2
        { productId: 2n, ticketTokenId: 3n, quantity: 1n }, // 1 pepsi → ticket 3
      ],
    ], { value: cartTotal });

    // 4. Return ticket #1 → cascade refund ticket 1 orders ONLY
    await ticketAsFan1.write.returnTicket([1n]);

    // Check: ticket 1 orders refunded, ticket 2+3 orders intact
    // Note: status is at index 9 for Order struct
    const orders1 = await f.stadiumShop.read.getOrdersByTicket([1n]);
    const orders2 = await f.stadiumShop.read.getOrdersByTicket([2n]);
    const orders3 = await f.stadiumShop.read.getOrdersByTicket([3n]);
    assert.equal(orders1[0].status, 4); // REFUNDED
    assert.equal(orders2[0].status, 0); // ACTIVE
    assert.equal(orders3[0].status, 0); // ACTIVE

    // 5. Mark ticket #2 entered via delegate verification
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([2n]);
    assert.equal(await f.ticketNFT.read.isEntered([2n]), true);

    // 6. Mark ticket #3 entered, confirm order, then collect
    await ticketAsVerifier.write.markEntered([3n]);

    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    // Multi-confirm: ticket 2 and 3 orders
    await f.stadiumShop.write.confirmOrders([[2n, 3n]]); 
    await shopAsOwner.write.confirmCollection([3n]); // Confirmed → Collected

    const order3 = await f.stadiumShop.read.orders([3n]);
    assert.equal(order3[9], 2); // COLLECTED = 2

    // 7. Mark event completed and settle
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    await f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]); // 5% platform

    const balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.isSettled, true);
    assert.equal(balance.ticketRevenue, bulkPrice);

    // 8. Verify claimable refund includes ticket + shop cascade
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    const ticketRefund = (f.generalPrice * 8000n) / 10000n;
    const shopRefund = f.popcornPrice * 2n;
    assert.equal(claimable, ticketRefund + shopRefund);
  });

  // ── Scenario 2: Event cancellation ──
  it("Should handle event cancellation with full refunds", async function () {
    const f = await fullSetup();

    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });

    // Two fans buy tickets
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan2.write.purchaseTicket([1n, 1n, ROW_A, 2n], { value: f.generalPrice });

    // Buy shop items
    const shopAsFan1 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan1.write.purchaseSingleItem([1n, 1n, 1n], { value: f.popcornPrice });

    // Cancel event
    await f.ticketNFT.write.cancelEvent([1n]);

    // Fan1 claims cancellation refund
    await ticketAsFan1.write.claimCancellationRefund([1n]);

    // Verify 100% ticket refund + 100% shop cascade
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(claimable, f.generalPrice + f.popcornPrice);
  });

  // ── Scenario 3: Delegate cannot do financial actions ──
  it("Should block delegate from returning tickets", async function () {
    const f = await fullSetup();

    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Set fan2 as delegate
    await ticketAsFan1.write.setDelegate([1n, f.fan2.account.address]);

    // Delegate tries to return ticket — should fail (not owner)
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await assert.rejects(ticketAsFan2.write.returnTicket([1n]));
  });

  // ── Scenario 4: Walk-in ticket flow ──
  it("Should mint and verify walk-in ticket", async function () {
    const f = await fullSetup();

    // Walk-in requires GATES_OPEN or IN_PROGRESS
    await f.ticketNFT.write.updateEventStatus([1n, 3]); // 3 = GATES_OPEN

    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    const nonce = "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe" as `0x${string}`;
    await ticketAsWalkIn.write.purchaseWalkInTicket([
      1n, 1n, ROW_A, 50n, f.admin.account.address, nonce,
    ]);

    // Token minted to admin (walk-in vault address)
    const owner = await f.ticketNFT.read.ownerOf([1n]);
    assert.equal(owner.toLowerCase(), f.admin.account.address.toLowerCase());

    // Walk-in ticket is non-refundable
    await assert.rejects(f.ticketNFT.write.returnTicket([1n]));
  });


  // ── Scenario 5: Vault math verification ──
  it("Should maintain correct vault accounting throughout lifecycle", async function () {
    const f = await fullSetup();

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });

    // Buy 2 tickets — Row A, seats 10 and 11
    await ticketAsFan.write.purchaseMultipleTickets([1n, 1n, [ROW_A, ROW_A], [10n, 11n]], { value: f.generalPrice * 2n });

    // Check vault received ticket revenue
    let balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.ticketRevenue, f.generalPrice * 2n);

    // Buy shop item on ticket 1 (tokenId 1)
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: f.popcornPrice });

    // Check shop revenue in vault
    balance = await f.vault.read.getEventBalance([1n]);
    assert.equal(balance.shopRevenue, f.popcornPrice);

    // Return ticket 1 (tokenId 1) — cascades shop refund
    await ticketAsFan.write.returnTicket([1n]);

    // Verify event balance tracking
    balance = await f.vault.read.getEventBalance([1n]);
    const expectedTicketRefund = (f.generalPrice * 8000n) / 10000n;
    assert.equal(balance.ticketRefunds, expectedTicketRefund);
    assert.equal(balance.shopRefunds, f.popcornPrice);

    // Verify vault actual balance
    const vaultBal = await publicClient.getBalance({ address: f.vault.address });
    const expectedVaultBal = f.generalPrice * 2n + f.popcornPrice; // All deposited, none withdrawn yet (pull-based)
    assert.equal(vaultBal, expectedVaultBal);
  });

  // ── Scenario 6: Entry after delegate set, then try to reassign ──
  it("Should prevent delegate reassignment after entry", async function () {
    const f = await fullSetup();

    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan1.write.setDelegate([1n, f.fan2.account.address]);

    // Mark entered
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);

    // Try to change delegate — should be locked
    await assert.rejects(
      ticketAsFan1.write.setDelegate([1n, f.fan3.account.address]),
    );
  });

  // ── Scenario 7: Reject ticket return after refund window ──
  it("should reject ticket return after refund window", async function () {
    const f = await fullSetup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });

    // Buy a ticket
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Advance time past 10 days minus 3 hours
    await publicClient.transport.request({ method: "evm_increaseTime", params: [864000] });
    await publicClient.transport.request({ method: "evm_mine", params: [] });
    await assert.rejects(ticketAsFan.write.returnTicket([1n]));
  });

  // ── Scenario 8: Reject double entry attempt ──
  it("should reject double entry attempt", async function () {
    const f = await fullSetup();

    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });

    // Buy a ticket
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Mark entered once — should succeed
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    assert.equal(await f.ticketNFT.read.isEntered([1n]), true);

    // Mark entered again — should revert with AlreadyEntered
    await assert.rejects(ticketAsVerifier.write.markEntered([1n]));
  });

  // ── Scenario 9: Reject shop registration without profile ──
  it("should reject shop purchase without profile", async function () {
    const f = await fullSetup();

    // fan3 has NO profile set — attempt to register a shop
    const shopAsFan3 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan3 },
    });

    // Should revert with ProfileRequired
    await assert.rejects(
      shopAsFan3.write.registerShop(["No Profile Shop", "Desc", "ipfs://x", [1n], ["Gate 1"]]),
    );
  });

  // ─────────────────────────────────────────────────────────────
  //           INTEGRATION AUDIT TESTS (T-42..T-46)
  // ─────────────────────────────────────────────────────────────

  // T-42: Full event cancellation via batch processor — fans self-serve refunds
  it("T-42: Full batch cancellation flow — all ticket holders receive 100% refund", async function () {
    const f = await fullSetup();
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan2.write.purchaseTicket([1n, 1n, ROW_A, 2n], { value: f.generalPrice });
    // Cancel event (no loop — just mark CANCELLED)
    await f.ticketNFT.write.cancelEvent([1n]);
    // Admin processes refunds in a single batch
    await f.ticketNFT.write.processCancellationRefunds([1n, 500n]);
    // Both fans should have claimable refunds equal to full purchase price
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
    assert.equal(await f.vault.read.claimableRefunds([f.fan2.account.address]), f.generalPrice);
    // Fans withdraw
    const vaultAsFan1 = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await vaultAsFan1.write.claimRefunds();
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), 0n);
  });

  // T-43: Enclosure force-refund batch flow
  it("T-43: forceRefundEnclosure + processEnclosureRefunds — enclosure 1 fully refunded", async function () {
    const f = await fullSetup();
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan2.write.purchaseTicket([1n, 2n, ROW_D, 1n], { value: f.vipPrice });
    await f.ticketNFT.write.forceRefundEnclosure([1n, 1n]);
    await f.ticketNFT.write.processEnclosureRefunds([1n, 1n, 500n]);
    // fan1 (general stand) got refund; fan2 (VIP) did not
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
    assert.equal(await f.vault.read.claimableRefunds([f.fan2.account.address]), 0n);
  });

  // T-44: Settlement accounting — shopRefunds excluded from settlement (C-02)
  it("T-44: settleEvent excludes shopRefunds from settlement distribution (C-02)", async function () {
    const f = await fullSetup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: f.popcornPrice });
    await ticketAsFan.write.returnTicket([1n]); // cascades shop refund
    await f.ticketNFT.write.updateEventStatus([1n, 5]); // COMPLETED
    // Settle — should not revert, shopRefunds excluded
    await assert.doesNotReject(f.vault.write.settleEvent([1n, 5n, f.eventManager.account.address]));
    // Fan's refund still available
    const refund = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.ok(refund > 0n);
  });

  // T-45: Batch cancel with mix of regular and walk-in tickets
  it("T-45: processCancellationRefunds skips walk-ins and refunds regular tickets", async function () {
    const f = await fullSetup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice }); // token 1
    await f.ticketNFT.write.updateEventStatus([1n, 3]); // GATES_OPEN
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    const nonce = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as `0x${string}`;
    await ticketAsWalkIn.write.purchaseWalkInTicket([1n, 1n, ROW_A, 2n, f.admin.account.address, nonce]); // token 2
    await f.ticketNFT.write.cancelEvent([1n]);
    await f.ticketNFT.write.processCancellationRefunds([1n, 500n]);
    // Regular ticket burned, walk-in still alive
    await assert.rejects(f.ticketNFT.read.ownerOf([1n]));
    const walkInOwner = await f.ticketNFT.read.ownerOf([2n]);
    assert.equal(walkInOwner.toLowerCase(), f.admin.account.address.toLowerCase());
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
  });

  // T-46: Fan self-serve claimCancellationRefund after cancelEvent (no admin batch needed)
  it("T-46: fan can claim refund via claimCancellationRefund without admin batch processing", async function () {
    const f = await fullSetup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.cancelEvent([1n]);
    // Fan self-serves — no admin batch needed
    await ticketAsFan.write.claimCancellationRefund([1n]);
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await vaultAsFan.write.claimRefunds();
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), 0n);
  });
});
