import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";
import { deployFixture, createVenueAndEvent } from "../fixtures/deploy.ts";

// Row labels: A=0x41, B=0x42, C=0x43, D=0x44, E=0x45
const ROW_A = "0x41";
const ROW_B = "0x42";
const ROW_C = "0x43";
const ROW_D = "0x44";
const ROW_E = "0x45";

describe("TicketNFT", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function setup() {
    const fixtures = await deployFixture(viem);
    const eventData = await createVenueAndEvent(viem, fixtures);
    return { ...fixtures, ...eventData };
  }

  // ── Test 1: Purchase single ticket ──
  it("Should mint soulbound ticket on purchase", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const owner = await f.ticketNFT.read.ownerOf([1n]);
    assert.equal(owner.toLowerCase(), f.fan1.account.address.toLowerCase());
  });

  // ── Test 2: Ticket data stored correctly ──
  it("Should store correct ticket data", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 5n], { value: f.generalPrice });
    const data = await f.ticketNFT.read.getTicketData([1n]);
    assert.equal(data.eventId, 1n);
    assert.equal(data.seatNumber, 5n);
    assert.equal(data.rowLabel, ROW_A);
    assert.equal(data.purchasePrice, f.generalPrice);
  });

  // ── Test 3: ETH forwarded to vault ──
  it("Should forward ETH to vault on purchase", async function () {
    const f = await setup();
    const vaultBalanceBefore = await publicClient.getBalance({ address: f.vault.address });
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const vaultBalanceAfter = await publicClient.getBalance({ address: f.vault.address });
    assert.equal(vaultBalanceAfter - vaultBalanceBefore, f.generalPrice);
  });

  // ── Test 4: Bulk purchase ──
  it("Should mint multiple tickets in bulk", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const totalPrice = f.generalPrice * 3n;
    await ticketAsFan.write.purchaseMultipleTickets([1n, 1n, [ROW_A, ROW_A, ROW_A], [1n, 2n, 3n]], { value: totalPrice });
    assert.equal((await f.ticketNFT.read.ownerOf([1n])).toLowerCase(), f.fan1.account.address.toLowerCase());
    assert.equal((await f.ticketNFT.read.ownerOf([2n])).toLowerCase(), f.fan1.account.address.toLowerCase());
    assert.equal((await f.ticketNFT.read.ownerOf([3n])).toLowerCase(), f.fan1.account.address.toLowerCase());
  });

  // ── Test 5: Soulbound - transfer blocked ──
  it("Should block transfer (soulbound)", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await assert.rejects(
      ticketAsFan.write.transferFrom([f.fan1.account.address, f.fan2.account.address, 1n]),
    );
  });

  // ── Test 6: Seat already booked ──
  it("Should revert on duplicate seat booking", async function () {
    const f = await setup();
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await assert.rejects(
      ticketAsFan2.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice }),
    );
  });

  // ── Test 7: Wrong ETH amount ──
  it("Should revert with insufficient payment", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await assert.rejects(
      ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice / 2n }),
    );
  });

  // ── Test 8: Return ticket - 80% refund credited ──
  it("Should return ticket and credit 80% refund", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    const expectedRefund = (f.generalPrice * 8000n) / 10000n; // 80%
    assert.equal(claimable, expectedRefund);
  });

  // ── Test 9: Cannot return after entry ──
  it("Should block return after entry", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    // Mark entered
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await assert.rejects(ticketAsFan.write.returnTicket([1n]));
  });

  // ── Test 10: Cannot return walk-in ticket ──
  it("Should block walk-in ticket return", async function () {
    const f = await setup();
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    // Walk-in requires GATES_OPEN or IN_PROGRESS
    await f.ticketNFT.write.updateEventStatus([1n, 3]); // 3 = GATES_OPEN

    const nonce = "0x0000000000000000000000000000000000000000000000000000000000000010" as `0x${string}`;
    await ticketAsWalkIn.write.purchaseWalkInTicket([
      1n, 1n, ROW_A, 50n, f.admin.account.address, nonce
    ]);
    // Walk-in ticket minted to admin, try return
    await assert.rejects(
      f.ticketNFT.write.returnTicket([1n]),
    );
  });

  // ── Test 11: Delegate system ──
  it("Should set and remove delegate", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.setDelegate([1n, f.fan2.account.address]);
    assert.equal(
      (await f.ticketNFT.read.getDelegate([1n])).toLowerCase(),
      f.fan2.account.address.toLowerCase(),
    );
    await ticketAsFan.write.removeDelegate([1n]);
    assert.equal(await f.ticketNFT.read.getDelegate([1n]), "0x0000000000000000000000000000000000000000");
  });

  // ── Test 12: Delegate locked after entry ──
  it("Should lock delegate after entry", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await assert.rejects(
      ticketAsFan.write.setDelegate([1n, f.fan2.account.address]),
    );
  });

  // ── Test 13: Mark entered (one-way flag) ──
  it("Should mark ticket as entered", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    assert.equal(await f.ticketNFT.read.isEntered([1n]), false);
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    assert.equal(await f.ticketNFT.read.isEntered([1n]), true);
  });

  // ── Test 14: Double entry blocked ──
  it("Should block double entry", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await ticketAsVerifier.write.markEntered([1n]);
    await assert.rejects(ticketAsVerifier.write.markEntered([1n]));
  });

  // ── Test 15: Cancel event ──
  it("Should cancel event and allow 100% refund", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    // Cancel event (admin)
    await f.ticketNFT.write.cancelEvent([1n]);
    // Claim cancellation refund
    await ticketAsFan.write.claimCancellationRefund([1n]);
    const claimable = await f.vault.read.claimableRefunds([f.fan1.account.address]);
    assert.equal(claimable, f.generalPrice); // 100%
  });

  // ── Test 16: Postpone event ──
  it("Should postpone event with new times", async function () {
    const f = await setup();
    const newStart = f.startTime + 172800n; // +2 days
    const newEnd = f.endTime + 172800n;
    await f.ticketNFT.write.postponeEvent([1n, newStart, newEnd]);
    const evt = await f.ticketNFT.read.getEvent([1n]);
    assert.equal(evt.startTime, newStart);
    assert.equal(evt.endTime, newEnd);
  });

  // ── Test 17: Invalid seat number ──
  it("Should revert on invalid seat number", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // Seat 9999 is beyond 5000 seats in General Stand Row A
    await assert.rejects(
      ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 9999n], { value: f.generalPrice }),
    );
  });

  // ── Test 18: Bulk purchase too many seats ──
  it("Should revert bulk purchase exceeding MAX_BULK_PURCHASE", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const seats = Array.from({ length: 11 }, (_, i) => BigInt(i + 1));
    const rows = Array.from({ length: 11 }, () => ROW_A);
    await assert.rejects(
      ticketAsFan.write.purchaseMultipleTickets([1n, 1n, rows, seats], { value: f.generalPrice * 11n }),
    );
  });

  // ── Test 19: Invalid row label ──
  it("Should revert on invalid row label", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // Row Z (0x5A) doesn't exist in General Stand
    await assert.rejects(
      ticketAsFan.write.purchaseTicket([1n, 1n, "0x5a", 1n], { value: f.generalPrice }),
    );
  });

  // ── Test 20: Purchase tickets across different rows in same enclosure ──
  it("Should purchase tickets on different rows (A5, B3, C1)", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // General Stand has Row A (5000), Row B (3000), Row C (2000)
    const totalPrice = f.generalPrice * 3n;
    await ticketAsFan.write.purchaseMultipleTickets(
      [1n, 1n, [ROW_A, ROW_B, ROW_C], [5n, 3n, 1n]],
      { value: totalPrice },
    );
    // Verify each ticket stored correct row/seat
    const ticket1 = await f.ticketNFT.read.getTicketData([1n]);
    assert.equal(ticket1.rowLabel, ROW_A);
    assert.equal(ticket1.seatNumber, 5n);

    const ticket2 = await f.ticketNFT.read.getTicketData([2n]);
    assert.equal(ticket2.rowLabel, ROW_B);
    assert.equal(ticket2.seatNumber, 3n);

    const ticket3 = await f.ticketNFT.read.getTicketData([3n]);
    assert.equal(ticket3.rowLabel, ROW_C);
    assert.equal(ticket3.seatNumber, 1n);
  });

  // ── Test 21: Purchase ticket on VIP enclosure with non-A starting rows (D, E) ──
  it("Should purchase ticket on rows starting from D (non-A start)", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // VIP Lounge (enclosure 2) has Row D (500 seats), Row E (300 seats)
    await ticketAsFan.write.purchaseTicket([1n, 2n, ROW_D, 100n], { value: f.vipPrice });
    const ticket = await f.ticketNFT.read.getTicketData([1n]);
    assert.equal(ticket.rowLabel, ROW_D);
    assert.equal(ticket.seatNumber, 100n);
    assert.equal(ticket.enclosureId, 2n);
  });

  // ── Test 22: VIP enclosure rejects Row A (not configured) ──
  it("Should revert on Row A for VIP enclosure that starts at Row D", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // VIP Lounge only has rows D and E, not A
    await assert.rejects(
      ticketAsFan.write.purchaseTicket([1n, 2n, ROW_A, 1n], { value: f.vipPrice }),
    );
  });

  // ── Test 23: Seat number respects per-row capacity ──
  it("Should revert when seat exceeds row capacity (Row B has 3000, not 5000)", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // General Stand Row B has 3000 seats, seat 4000 is invalid
    await assert.rejects(
      ticketAsFan.write.purchaseTicket([1n, 1n, ROW_B, 4000n], { value: f.generalPrice }),
    );
  });

  // ─────────────────────────────────────────────────────────────
  //                AUDIT REMEDIATION TESTS (T-01..T-16)
  // ─────────────────────────────────────────────────────────────

  // T-01: cancelEvent with no tickets → event marked CANCELLED, batch processor is a no-op
  it("T-01: cancelEvent with 0 tickets and idempotent batch processor", async function () {
    const f = await setup();
    await f.ticketNFT.write.cancelEvent([1n]);
    const evt = await f.ticketNFT.read.getEvent([1n]);
    assert.equal(evt.status, 6); // 6 = CANCELLED
    await f.ticketNFT.write.processCancellationRefunds([1n, 500n]);
    const cursor = await f.ticketNFT.read.cancellationCursor([1n]);
    assert.ok(cursor >= 1n);
  });

  // T-02: processCancellationRefunds skips walk-in tokens, credits regular tickets only
  it("T-02: processCancellationRefunds skips walk-in tokens and credits regular tickets", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.updateEventStatus([1n, 3]); // GATES_OPEN for walk-in
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    const nonce = "0x1234560000000000000000000000000000000000000000000000000000000001" as `0x${string}`;
    await ticketAsWalkIn.write.purchaseWalkInTicket([1n, 1n, ROW_A, 2n, f.admin.account.address, nonce]);
    await f.ticketNFT.write.cancelEvent([1n]);
    await f.ticketNFT.write.processCancellationRefunds([1n, 500n]);
    await assert.rejects(f.ticketNFT.read.ownerOf([1n])); // regular ticket burned
    const walkInOwner = await f.ticketNFT.read.ownerOf([2n]);
    assert.equal(walkInOwner.toLowerCase(), f.admin.account.address.toLowerCase()); // walk-in still alive
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
  });

  // T-03: claimCancellationRefund reverts with WalkInNonRefundable (H-03)
  it("T-03: claimCancellationRefund reverts WalkInNonRefundable for walk-in token", async function () {
    const f = await setup();
    await f.ticketNFT.write.updateEventStatus([1n, 3]);
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    const nonce = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`;
    await ticketAsWalkIn.write.purchaseWalkInTicket([1n, 1n, ROW_A, 5n, f.admin.account.address, nonce]);
    await f.ticketNFT.write.cancelEvent([1n]);
    await assert.rejects(f.ticketNFT.write.claimCancellationRefund([1n])); // admin owns it, but walk-in
  });

  // T-04: claimCancellationRefund on already-burned ticket reverts
  it("T-04: claimCancellationRefund after returnTicket reverts (token already burned)", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan.write.returnTicket([1n]);
    await f.ticketNFT.write.cancelEvent([1n]);
    await assert.rejects(ticketAsFan.write.claimCancellationRefund([1n]));
  });

  // T-05: processCancellationRefunds reverts when event is not CANCELLED
  it("T-05: processCancellationRefunds reverts on non-CANCELLED event", async function () {
    const f = await setup();
    await assert.rejects(f.ticketNFT.write.processCancellationRefunds([1n, 300n]));
  });

  // T-06: cursor advances correctly across small batches
  it("T-06: processCancellationRefunds cursor advances across batches", async function () {
    const f = await setup();
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await ticketAsFan2.write.purchaseTicket([1n, 1n, ROW_A, 2n], { value: f.generalPrice });
    await f.ticketNFT.write.cancelEvent([1n]);
    await f.ticketNFT.write.processCancellationRefunds([1n, 1n]); // batch of 1
    const afterFirst = await f.ticketNFT.read.cancellationCursor([1n]);
    await f.ticketNFT.write.processCancellationRefunds([1n, 500n]); // rest
    const afterSecond = await f.ticketNFT.read.cancellationCursor([1n]);
    assert.ok(afterSecond > afterFirst);
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
    assert.equal(await f.vault.read.claimableRefunds([f.fan2.account.address]), f.generalPrice);
  });

  // T-07: forceRefundEnclosure + processEnclosureRefunds only targets that enclosure
  it("T-07: processEnclosureRefunds refunds target enclosure, leaves others untouched", async function () {
    const f = await setup();
    const ticketAsFan1 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    const ticketAsFan2 = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan2 },
    });
    await ticketAsFan1.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice }); // token 1, enc 1
    await ticketAsFan2.write.purchaseTicket([1n, 2n, ROW_D, 1n], { value: f.vipPrice });    // token 2, enc 2
    await f.ticketNFT.write.forceRefundEnclosure([1n, 1n]);
    assert.equal(await f.ticketNFT.read.enclosureRefundInitiated([1n, 1n]), true);
    assert.equal(await f.ticketNFT.read.enclosureRefundInitiated([1n, 2n]), false);
    await f.ticketNFT.write.processEnclosureRefunds([1n, 1n, 500n]);
    await assert.rejects(f.ticketNFT.read.ownerOf([1n])); // enc 1 ticket burned
    const owner2 = await f.ticketNFT.read.ownerOf([2n]);
    assert.equal(owner2.toLowerCase(), f.fan2.account.address.toLowerCase()); // enc 2 untouched
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
  });

  // T-08: processEnclosureRefunds reverts without prior forceRefundEnclosure
  it("T-08: processEnclosureRefunds reverts without forceRefundEnclosure call", async function () {
    const f = await setup();
    await assert.rejects(f.ticketNFT.write.processEnclosureRefunds([1n, 1n, 300n]));
  });

  // T-09: updateEvent reverts EventVenueChangeLocked when status != CREATED (L-03)
  it("T-09: updateEvent reverts EventVenueChangeLocked on LIVE event venue change", async function () {
    const f = await setup();
    // Adding a second venue for the test
    await f.venueRegistry.write.createVenue(["Venue2", "City2", "ipfs://v2"]);
    await f.venueRegistry.write.addEnclosure([2n, "Stand", [ROW_A], [100n]]);
    // Event 1 is LIVE — changing venue should revert
    await assert.rejects(f.ticketNFT.write.updateEvent([1n, "New Title", 2n]));
  });

  // T-10: markEntered reverts TicketNotFound for nonexistent tokenId (L-02)
  it("T-10: markEntered reverts TicketNotFound for nonexistent token", async function () {
    const f = await setup();
    const ticketAsVerifier = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.qrVerifier },
    });
    await assert.rejects(ticketAsVerifier.write.markEntered([9999n]));
  });

  // T-11: purchaseWalkInTicket stores entryCode directly as off-chain generated hash (C-03)
  it("T-11: Walk-In stores pre-hashed secret offchain and verifies against native raw payload", async function () {
    const f = await setup();
    await f.ticketNFT.write.updateEventStatus([1n, 3]); // GATES_OPEN
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    
    // Server generates a raw secret and only passes the hash to the chain
    const rawSecret = toHex("Walk-In-Secret-Password-123", { size: 32 });
    const secretHash = keccak256(rawSecret);
    
    await ticketAsWalkIn.write.purchaseWalkInTicket([1n, 1n, ROW_A, 3n, f.admin.account.address, secretHash]);
    
    const ticketData = await f.ticketNFT.read.getTicketData([1n]);
    assert.equal(ticketData.walkInEntryCode, secretHash);
    
    // Verification physically scans the raw string, contract hashes it natively to compare
    const valid = await f.ticketNFT.read.verifyWalkInCode([1n, rawSecret]);
    assert.equal(valid, true);
  });

  // T-12: purchaseWalkInTicket reverts when event is LIVE
  it("T-12: purchaseWalkInTicket reverts on LIVE event (requires GATES_OPEN or IN_PROGRESS)", async function () {
    const f = await setup();
    const ticketAsWalkIn = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.walkInManager },
    });
    const nonce = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
    await assert.rejects(
      ticketAsWalkIn.write.purchaseWalkInTicket([1n, 1n, ROW_A, 1n, f.admin.account.address, nonce]),
    );
  });

  // T-13: verifyWalkInCode returns false for non-walk-in token
  it("T-13: verifyWalkInCode returns false for regular soulbound ticket", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    const isValid = await f.ticketNFT.read.verifyWalkInCode([
      1n,
      "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    ]);
    assert.equal(isValid, false);
  });

  // T-14: cancellationCursor starts at 0 (public state)
  it("T-14: cancellationCursor starts at 0 before any cancel", async function () {
    const f = await setup();
    assert.equal(await f.ticketNFT.read.cancellationCursor([1n]), 0n);
  });

  // T-15: fan can call claimCancellationRefund before admin runs the batch (self-service)
  it("T-15: fan can self-serve claimCancellationRefund before admin batch", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.cancelEvent([1n]);
    await ticketAsFan.write.claimCancellationRefund([1n]);
    assert.equal(await f.vault.read.claimableRefunds([f.fan1.account.address]), f.generalPrice);
  });

  // T-16: returnTicket reverts UseClaimCancellationRefund on CANCELLED event
  it("T-16: returnTicket on CANCELLED event reverts UseClaimCancellationRefund", async function () {
    const f = await setup();
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    await ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice });
    await f.ticketNFT.write.cancelEvent([1n]);
    await assert.rejects(ticketAsFan.write.returnTicket([1n]));
  });

  // ── Test 17: Pause and unpause ticket operations ──
  it("Should pause and unpause ticket operations", async function () {
    const f = await setup();
    await f.ticketNFT.write.pause(["Emergency"]);
    const ticketAsFan = await viem.getContractAt("TicketNFT", f.ticketNFT.address, {
      client: { wallet: f.fan1 },
    });
    // Purchase should fail while paused
    await assert.rejects(ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice }));
    await f.ticketNFT.write.unpause();
    // Should succeed after unpause
    await assert.doesNotReject(ticketAsFan.write.purchaseTicket([1n, 1n, ROW_A, 1n], { value: f.generalPrice }));
  });

  // ── Test 18: setMinimumTicketPrice override ──
  it("Should override minimum ticket price and affect setEventPricing", async function () {
    const f = await setup();
    await f.ticketNFT.write.setMinimumTicketPrice([1000000000000000n]); // 0.001 ETH
    await assert.rejects(
      f.ticketNFT.write.setEventPricing([1n, 1n, 500000000000000n]) // 0.0005 ETH
    );
  });

  // ── Test 19: setStadiumShopAddress zero address revert ──
  it("Should revert when setting stadium shop address to zero", async function () {
    const f = await setup();
    await assert.rejects(
      f.ticketNFT.write.setStadiumShopAddress(["0x0000000000000000000000000000000000000000"]),
      /ZeroAddress/
    );
  });
});

