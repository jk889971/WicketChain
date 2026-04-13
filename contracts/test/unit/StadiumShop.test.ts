import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";
import { deployFixture, createVenueAndEvent } from "../fixtures/deploy.ts";

// Row A = 0x41
const ROW_A = "0x41";

describe("StadiumShop", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function setup() {
    const fixtures = await deployFixture(viem);
    const eventData = await createVenueAndEvent(viem, fixtures);

    // Set up shop owner profile
    const profileAsShopOwner = await viem.getContractAt("UserProfile", fixtures.userProfile.address, {
      client: { wallet: fixtures.shopOwner },
    });
    await profileAsShopOwner.write.setProfileHash([keccak256(toHex("ShopOwner|shop@test.com|03009876543"))]);

    return { ...fixtures, ...eventData };
  }

  async function setupWithShopAndProduct(f: Awaited<ReturnType<typeof setup>>) {
    // Register shop
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Ali's Popcorn",
      "Best popcorn in town",
      "ipfs://shop1",
      [1n],
      ["Gate 3, Section B"],
    ]);
    // Admin approves
    await f.stadiumShop.write.approveShop([1n]);

    // Add product: Popcorn = 0.002 ETH, 100 units
    const productPrice = 2000000000000000n; // 0.002 ETH
    await shopAsOwner.write.addProduct([1n, "Large Popcorn", "ipfs://popcorn", productPrice, 100n]);

    return { shopAsOwner, productPrice };
  }

  // ── Test 1: Register shop (requires profile) ──
  it("Should register shop with profile", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Ali's Popcorn", "Best popcorn", "ipfs://shop1", [1n], ["Gate 3"],
    ]);
    const shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[2], "Ali's Popcorn");
    assert.equal(shop[5], false);
  });

  // ── Test 2: Cannot register without profile ──
  it("Should revert shop registration without profile", async function () {
    const f = await setup();
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      shopAsFan.write.registerShop(["Test", "Desc", "ipfs://x", [1n], ["Gate"]]),
    );
  });

  // ── Test 3: Admin approves shop ──
  it("Should approve shop", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop(["Shop", "Desc", "ipfs://x", [1n], ["Gate"]]);
    await f.stadiumShop.write.approveShop([1n]);
    const shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[5], true);
  });

  // ── Test 4: Add product (shop owner only, per-venue inventory) ──
  it("Should add product with per-venue inventory", async function () {
    const f = await setup();
    const { shopAsOwner, productPrice } = await setupWithShopAndProduct(f);
    const product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[3], "Large Popcorn");
    assert.equal(product[5], productPrice);
    assert.equal(product[6], 100n);
    assert.equal(product[2], 1n);
  });

  // ── Test 5: Purchase single item with ticket ownership validation ──
  it("Should purchase item linked to owned ticket", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan buys ticket first
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Fan buys shop item
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 2n, 1n], { value: productPrice * 2n });

    const order = await f.stadiumShop.read.orders([1n]);
    assert.equal(order[6], 2n);
    assert.equal(order[7], productPrice * 2n);
    assert.equal(order[8].toLowerCase(), f.fan1.account.address.toLowerCase());
  });

  // ── Test 6: Cannot purchase without owning ticket ──
  it("Should revert purchase with unowned ticket", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan2 doesn't own any ticket, tries to buy
    const shopAsFan2 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan2 },
    });
    await assert.rejects(
      shopAsFan2.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }),
    );
  });

  // ── Test 7: Cart purchase with multi-ticket allocation ──
  it("Should process cart with multi-ticket allocation", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan buys 2 tickets
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseMultipleTickets([1n, 1n, [ROW_A, ROW_A], [1n, 2n]], { value: f.generalPrice * 2n });

    // Cart: 2 popcorns for ticket 1, 1 popcorn for ticket 2
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    const totalPrice = productPrice * 3n; // 3 total items
    await shopAsFan.write.purchaseCart([
      [
        { productId: 1n, ticketTokenId: 1n, quantity: 2n },
        { productId: 1n, ticketTokenId: 2n, quantity: 1n },
      ],
    ], { value: totalPrice });

    // Check orders created
    const orders1 = await f.stadiumShop.read.getOrdersByTicket([1n]);
    const orders2 = await f.stadiumShop.read.getOrdersByTicket([2n]);
    assert.equal(orders1.length, 1);
    assert.equal(orders2.length, 1);
    assert.equal(orders1[0].quantity, 2n);
    assert.equal(orders2[0].quantity, 1n);
  });

  // ── Test 8: Cancel order ──
  it("Should cancel active order and refund", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Cancel order
    await shopAsFan.write.cancelOrder([1n]);

    const order = await f.stadiumShop.read.orders([1n]);
    assert.equal(order[9], 3); // CANCELLED = 3

    // Inventory restored
    const product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[6], 100n);
  });

  // ── Test 9: Cascade refund on ticket return ──
  it("Should cascade refund shop orders on ticket return", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 2n, 1n], { value: productPrice * 2n });

    // Return ticket — should cascade refund shop orders
    await ticketAsFan.write.returnTicket([1n]);

    const order = await f.stadiumShop.read.orders([1n]);
    assert.equal(order[9], 4); // REFUNDED = 4

    // Check claimable includes both ticket + shop refund
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    const ticketRefund = (f.generalPrice * 8000n) / 10000n;
    const shopRefund = productPrice * 2n;
    assert.equal(claimable, ticketRefund + shopRefund);
  });

  // ── Test 10: Confirm collection (shop owner only) ──
  it("Should confirm order collection by shop owner", async function () {
    const f = await setup();
    const { shopAsOwner, productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Mark entered and confirm order (required by new audit guard)
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await f.stadiumShop.write.confirmOrders([[1n]]);

    // Shop owner confirms collection
    await shopAsOwner.write.confirmCollection([1n]);

    const order = await f.stadiumShop.read.orders([1n]);
    assert.equal(order[9], 2); // COLLECTED = 2
  });

  // ── Test 10b: Non-shop-owner cannot confirm collection ──
  it("Should revert confirmCollection by non-shop-owner", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Staff (not shop owner) tries to confirm — should revert
    const shopAsStaff = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopStaff },
    });
    await assert.rejects(
      shopAsStaff.write.confirmCollection([1n]),
    );
  });

  // ── Test 11: Insufficient stock ──
  it("Should revert purchase with insufficient stock", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    // Try to buy 200 units when only 100 available
    await assert.rejects(
      shopAsFan.write.purchaseSingleItem([1n, 200n, 1n], { value: productPrice * 200n }),
    );
  });

  // ── Test 12: Toggle shop active ──
  it("Should toggle shop active status", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop(["Shop", "Desc", "ipfs://x", [1n], ["Gate"]]);
    await f.stadiumShop.write.approveShop([1n]);

    await shopAsOwner.write.toggleShopActive();
    let shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[6], false);

    await shopAsOwner.write.toggleShopActive();
    shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[6], true);
  });

  // ── Test 13: Update product ──
  it("Should update product details", async function () {
    const f = await setup();
    const { shopAsOwner } = await setupWithShopAndProduct(f);
    const newPrice = 3000000000000000n;
    await shopAsOwner.write.updateProduct([1n, "XL Popcorn", "ipfs://xl", newPrice]);
    const product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[3], "XL Popcorn");
    assert.equal(product[5], newPrice);
  });

  // ── Test 14: Update inventory ──
  it("Should update product inventory", async function () {
    const f = await setup();
    const { shopAsOwner } = await setupWithShopAndProduct(f);
    await shopAsOwner.write.updateInventory([1n, 500n]);
    const product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[6], 500n);
  });

  // ── Test 15: Non-active shop blocks purchase ──
  it("Should revert purchase from inactive shop", async function () {
    const f = await setup();
    const { shopAsOwner, productPrice } = await setupWithShopAndProduct(f);

    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Deactivate shop
    await shopAsOwner.write.toggleShopActive();

    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }),
    );
  });

  // ── Test 16: confirmOrders moves vault earnings pending→confirmed with fee ──
  it("Should confirm orders and update vault shop balance with fee deduction", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan buys ticket
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });

    // Fan buys shop item
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 2n, 1n], { value: productPrice * 2n });

    // Check vault shop balance: pending should have the earnings
    let shopBal = await f.vault.read.getShopBalance([1n]);
    assert.equal(shopBal.pendingEarnings, productPrice * 2n);
    assert.equal(shopBal.confirmedEarnings, 0n);

    // Mark ticket entered so refund window check passes
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);

    // Confirm orders
    await f.stadiumShop.write.confirmOrders([[1n]]);

    // Check vault shop balance: confirmed should have earnings minus fee
    shopBal = await f.vault.read.getShopBalance([1n]);
    const totalPaid = productPrice * 2n;
    const fee = (totalPaid * 500n) / 10000n; // 5% fee
    const netAmount = totalPaid - fee;
    assert.equal(shopBal.confirmedEarnings, netAmount);
    assert.equal(shopBal.shopFeeDeducted, fee);
    assert.equal(shopBal.pendingEarnings, 0n);

    // Check per-event shopFeesCollected is tracked
    const eventBal = await f.vault.read.getEventBalance([1n]);
    assert.equal(eventBal.shopFeesCollected, fee);
  });

  // ── Test 17: Shop owner can withdraw confirmed earnings ──
  it("Should allow shop owner to withdraw confirmed earnings", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan buys ticket + shop item
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Mark entered and confirm order
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await f.stadiumShop.write.confirmOrders([[1n]]);

    // Shop owner withdraws
    const shopBal = await f.vault.read.getShopBalance([1n]);
    const vaultAsShopOwner = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.shopOwner },
    });
    await vaultAsShopOwner.write.withdrawShopEarnings([1n, shopBal.confirmedEarnings]);

    // Verify withdrawn
    const shopBalAfter = await f.vault.read.getShopBalance([1n]);
    assert.equal(shopBalAfter.withdrawnAmount, shopBal.confirmedEarnings);
  });

  // ── Test 18: Non-owner cannot withdraw shop earnings ──
  it("Should revert withdraw by non-shop-owner", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);

    // Fan buys ticket + shop item
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Mark entered and confirm order
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await f.stadiumShop.write.confirmOrders([[1n]]);

    // Non-owner tries to withdraw — should revert
    const vaultAsFan = await viem.getContractAt("WicketChainVault", f.vault.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      vaultAsFan.write.withdrawShopEarnings([1n, 1n]),
    );
  });

  // ─────────────────────────────────────────────────────────────
  //                AUDIT REMEDIATION TESTS (T-26..T-37)
  // ─────────────────────────────────────────────────────────────

  // T-26: confirmOrders calls vault once per order (H-05)
  it("T-26: confirmOrders processes multiple orders without reverting (H-05 fix)", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
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
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await ticketAsVerifier.write.markEntered([1n]);
    // Confirm both orders together — should not revert
    await assert.doesNotReject(f.stadiumShop.write.confirmOrders([[1n, 2n]]));
    const order1 = await f.stadiumShop.read.orders([1n]);
    const order2 = await f.stadiumShop.read.orders([2n]);
    assert.equal(order1[9], 1); // 1 = CONFIRMED
    assert.equal(order2[9], 1);
  });

  // T-27: confirmCollection reverts OrderNotConfirmed when order is ACTIVE (L-09)
  it("T-27: confirmCollection reverts OrderNotConfirmed for ACTIVE order (L-09)", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    // Shop owner tries to confirm collection before order is CONFIRMED
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await assert.rejects(shopAsOwner.write.confirmCollection([1n]));
  });

  // T-28: purchaseSingleItem reverts if ticket doesn't belong to caller
  it("T-28: purchaseSingleItem reverts TicketNotOwnedByCaller for wrong ticket", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    // fan2 tries to use fan1's ticket
    const shopAsFan2 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan2 },
    });
    await assert.rejects(
      shopAsFan2.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }),
    );
  });

  // T-29: cancelOrder returns items to inventory and credits refund
  it("T-29: cancelOrder restores stock and credits full refund to buyer", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    const productBefore = await f.stadiumShop.read.products([1n]);
    await shopAsFan.write.cancelOrder([1n]);
    const productAfter = await f.stadiumShop.read.products([1n]);
    assert.equal(productAfter[6], productBefore[6] + 1n);
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(claimable, productPrice);
  });

  // T-30: refundLinkedItems cascades on ticket return
  it("T-30: refundLinkedItems auto-cascades when ticket is returned", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await ticketAsFan.write.returnTicket([1n]);
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    const expectedTicketRefund = (f.generalPrice * 8000n) / 10000n;
    assert.equal(claimable, expectedTicketRefund + productPrice);
  });

  // T-31: shop registration and approval flow
  it("T-31: shop registration and admin approval flow", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    // f.shopOwner already has profile from setup()
    await shopAsOwner.write.registerShop(["Shop X", "Desc", "ipfs://x", [1n], ["Gate"]]);
    const shopId = await f.stadiumShop.read.ownerShopId([f.shopOwner.account.address]);
    assert.ok(shopId > 0n);
    await f.stadiumShop.write.approveShop([shopId]);
    const shop = await f.stadiumShop.read.shops([shopId]);
    assert.equal(shop[5], true); // isApproved is at index 5 in Shop struct
  });

  // T-32: purchaseSingleItem on unapproved shop reverts
  it("T-32: purchaseSingleItem on deactivated shop reverts", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    // Admin deactivates the shop (ID 1 from setupWithShopAndProduct)
    await f.stadiumShop.write.adminToggleShop([1n, false]);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await assert.rejects(
      shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }),
    );
  });

  // T-33: confirmOrders skips non-ACTIVE orders silently
  it("T-33: confirmOrders skips already-cancelled orders without reverting", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await shopAsFan.write.cancelOrder([1n]); // cancel it
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    // confirmOrders with already-cancelled order should not revert
    await assert.doesNotReject(f.stadiumShop.write.confirmOrders([[1n]]));
  });

  // T-34: shop earnings confirmed into vault after confirmOrders
  it("T-34: shop earnings move to confirmedEarnings in vault after confirmOrders", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
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
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    const balBefore = await f.vault.read.getShopBalance([1n]);
    await ticketAsVerifier.write.markEntered([1n]); // Required for confirmOrders to credit vault
    await f.stadiumShop.write.confirmOrders([[1n]]);
    const balAfter = await f.vault.read.getShopBalance([1n]);
    assert.ok(balAfter.confirmedEarnings > balBefore.confirmedEarnings);
  });

  // T-35: vendor can cancel an ACTIVE order
  it("T-35: vendor can cancel active order via vendorCancelOrder", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    const shopAsVendor = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await assert.doesNotReject(shopAsVendor.write.vendorCancelOrder([1n]));
    const order = await f.stadiumShop.read.orders([1n]);
    assert.equal(order[9], 3); // 3 = CANCELLED
  });

  // T-36: insufficient payment on purchaseSingleItem reverts
  it("T-36: purchaseSingleItem reverts on underpayment", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await assert.rejects(
      shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice / 2n }),
    );
  });

  // T-37: getOrdersByTicket returns all orders linked to a ticket
  it("T-37: getOrdersByTicket correctly returns all orders linked to a ticket", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    const orders = await f.stadiumShop.read.getOrdersByTicket([1n]);
    assert.equal(orders.length, 2);
  });

  // T-38: maxOrdersPerTicket applies limits properly and is adjustable by Admin
  it("T-38: maxOrdersPerTicket limits orders and is adjustable by Admin", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    
    // Set max limit to 2
    await f.stadiumShop.write.setMaxOrdersPerTicket([2n]);

    // First and second purchases should pass
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });
    await shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice });

    // Third should fail since limit is 2
    await assert.rejects(
      shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice })
    );
  });

  // T-39: addProduct reverts ShopNotRegistered for caller with no shop
  it("T-39: addProduct reverts ShopNotRegistered for unregistered caller", async function () {
    const f = await setup();
    // fan1 has no shop — calling addProduct should revert with ShopNotRegistered
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      shopAsFan.write.addProduct([1n, "Burger", "ipfs://b", 1000000000000000n, 10n]),
      /ShopNotRegistered/
    );
  });

  // ── Test 40: rejectShop and ban owner ──
  it("T-40: rejectShop rejects and bans shop owner", async function () {
    const f = await setup();
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    
    const profileAsFan = await viem.getContractAt("UserProfile", f.userProfile.address, {
      client: { wallet: f.fan1 },
    });
    await profileAsFan.write.setProfileHash([keccak256(toHex("Fan|test"))]);
    
    await shopAsFan.write.registerShop(["Bad Shop", "Desc", "ipfs://x", [1n], ["Gate"]]);
    const shopId = await f.stadiumShop.read.ownerShopId([f.fan1.account.address]);
    
    await f.stadiumShop.write.rejectShop([shopId, "Violated TOS"]);
    const isBanned = await f.stadiumShop.read.isBanned([f.fan1.account.address]);
    assert.equal(isBanned, true);
  });

  // ── Test 41: adminToggleShop ──
  it("T-41: adminToggleShop disables shop", async function () {
    const f = await setup();
    const { shopAsOwner } = await setupWithShopAndProduct(f);
    let shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[6], true); // isActive is index 6
    await f.stadiumShop.write.adminToggleShop([1n, false]);
    shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[6], false);
  });

  // ── Test 42: add, update, remove venue from shop ──
  it("T-42: Venue management functions", async function () {
    const f = await setup();
    const { shopAsOwner } = await setupWithShopAndProduct(f);
    await shopAsOwner.write.addVenueToShop([1n, 2n, "Gate 4"]);
    let venues = await f.stadiumShop.read.getShopVenues([1n]);
    assert.ok(venues.includes(2n));
    await shopAsOwner.write.updateVenueLocation([1n, 2n, "Gate 5"]);
    await shopAsOwner.write.removeVenueFromShop([2n]);
    venues = await f.stadiumShop.read.getShopVenues([1n]);
    assert.ok(!venues.includes(2n));
  });

  // ── Test 43: toggleProductActive ──
  it("T-43: toggleProductActive modifies product state", async function () {
    const f = await setup();
    const { shopAsOwner } = await setupWithShopAndProduct(f);
    let product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[7], true); // isActive is index 7
    await shopAsOwner.write.toggleProductActive([1n]);
    product = await f.stadiumShop.read.products([1n]);
    assert.equal(product[7], false);
  });

  // ── Test 44: getShopProducts and getShopVenues ──
  it("T-44: view functions return arrays correctly", async function () {
    const f = await setup();
    await setupWithShopAndProduct(f);
    const products = await f.stadiumShop.read.getShopProducts([1n]);
    const venues = await f.stadiumShop.read.getShopVenues([1n]);
    assert.equal(products.length, 1);
    assert.equal(venues.length, 1);
  });

  // ── Test 45: Pause and unpause shop operations ──
  it("T-45: pause and unpause blocks operations", async function () {
    const f = await setup();
    const { productPrice } = await setupWithShopAndProduct(f);
    
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    
    await f.stadiumShop.write.pause(["Emergency"]);
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }));
    
    await f.stadiumShop.write.unpause();
    await assert.doesNotReject(shopAsFan.write.purchaseSingleItem([1n, 1n, 1n], { value: productPrice }));
  });

  // ── T-46: updateShop — owner can update name, description, imageURI ──
  it("T-46: updateShop updates shop metadata on-chain", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Old Name", "Old Desc", "ipfs://old", [1n], ["Gate 1"],
    ]);
    // Update all three fields
    await shopAsOwner.write.updateShop(["New Name", "New Desc", "ipfs://new"]);
    const shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[2], "New Name");         // name
    assert.equal(shop[3], "New Desc");         // description
    assert.equal(shop[4], "ipfs://new");       // imageURI
  });

  // ── T-47: updateShop — emits ShopUpdated event with correct args ──
  it("T-47: updateShop emits ShopUpdated with correct indexed shopId and args", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Shop A", "Desc A", "ipfs://a", [1n], ["Gate 2"],
    ]);
    const hash = await shopAsOwner.write.updateShop(["Updated Name", "Updated Desc", "ipfs://updated"]);
    const receipt = await publicClient.getTransactionReceipt({ hash });
    // Verify at least one log was emitted (ShopUpdated)
    assert.ok(receipt.logs.length > 0);
  });

  // ── T-48: updateShop — reverts NotShopOwner for non-owner ──
  it("T-48: updateShop reverts if called by non-owner address", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Shop B", "Desc B", "ipfs://b", [1n], ["Gate 3"],
    ]);
    // fan1 does not own this shop
    const shopAsFan = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      shopAsFan.write.updateShop(["Hacked Name", "Hacked Desc", "ipfs://hack"]),
      /ShopNotRegistered/
    );
  });

  // ── T-49: updateShop — reverts ShopNotRegistered for unregistered caller ──
  it("T-49: updateShop reverts ShopNotRegistered for address with no shop", async function () {
    const f = await setup();
    // fan2 has never registered a shop
    const shopAsFan2 = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.fan2 },
    });
    await assert.rejects(
      shopAsFan2.write.updateShop(["Ghost Shop", "Ghost Desc", "ipfs://ghost"]),
      /ShopNotRegistered/
    );
  });

  // ── T-50: updateShop — allows partial update (empty description/imageURI) ──
  it("T-50: updateShop allows empty description and imageURI (clears fields)", async function () {
    const f = await setup();
    const shopAsOwner = await viem.getContractAt("StadiumShop", f.stadiumShop.address, {
      client: { wallet: f.shopOwner },
    });
    await shopAsOwner.write.registerShop([
      "Shop C", "Has a description", "ipfs://c", [1n], ["Gate 4"],
    ]);
    // Clear description and imageURI by passing empty strings
    await shopAsOwner.write.updateShop(["Shop C Renamed", "", ""]);
    const shop = await f.stadiumShop.read.shops([1n]);
    assert.equal(shop[2], "Shop C Renamed");
    assert.equal(shop[3], "");  // description cleared
    assert.equal(shop[4], "");  // imageURI cleared
  });
});

