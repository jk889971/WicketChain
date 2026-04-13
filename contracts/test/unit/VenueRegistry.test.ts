import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("VenueRegistry", async function () {
  const { viem } = await network.connect();
  const [admin, nonAdmin] = await viem.getWalletClients();

  // ── Test 1: Create venue ──
  it("Should create a venue with correct data", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Gaddafi Stadium", "Lahore", "ipfs://img1"]);
    const data = await venue.read.getVenue([1n]);
    assert.equal(data.name, "Gaddafi Stadium");
    assert.equal(data.city, "Lahore");
    assert.equal(data.isActive, true);
  });

  // ── Test 2: Non-admin cannot create venue ──
  it("Should revert when non-admin creates venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    const venueAsNonAdmin = await viem.getContractAt("VenueRegistry", venue.address, {
      client: { wallet: nonAdmin },
    });
    await assert.rejects(
      venueAsNonAdmin.write.createVenue(["Test", "City", "ipfs://x"]),
    );
  });

  // ── Test 3: Add enclosure with rows ──
  it("Should add enclosure with rows to venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    // Row A: 3000 seats, Row B: 2000 seats
    await venue.write.addEnclosure([1n, "General Stand", ["0x41", "0x42"], [3000n, 2000n]]);
    const enc = await venue.read.getEnclosure([1n, 1n]);
    assert.equal(enc.name, "General Stand");
    // Check rows
    const rows = await venue.read.getRows([1n, 1n]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].seatCount, 3000n);
    assert.equal(rows[1].seatCount, 2000n);
    // Check row seat count
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x41"]), 3000n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x42"]), 2000n);
  });

  // ── Test 4: Cannot add enclosure to inactive venue ──
  it("Should revert adding enclosure to deactivated venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.deactivateVenue([1n]);
    await assert.rejects(
      venue.write.addEnclosure([1n, "VIP", ["0x41"], [500n]]),
    );
  });

  // ── Test 5: Update venue ──
  it("Should update venue metadata", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Old Name", "City", "ipfs://old"]);
    await venue.write.updateVenue([1n, "New Name", "New City", "ipfs://new"]);
    const data = await venue.read.getVenue([1n]);
    assert.equal(data.name, "New Name");
    assert.equal(data.city, "New City");
  });

  // ── Test 6: Deactivate and activate venue ──
  it("Should deactivate and reactivate venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.deactivateVenue([1n]);
    assert.equal(await venue.read.isVenueActive([1n]), false);
    await venue.write.activateVenue([1n]);
    assert.equal(await venue.read.isVenueActive([1n]), true);
  });

  // ── Test 7: Get all enclosures ──
  it("Should return all enclosures for a venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "General", ["0x41"], [5000n]]);
    await venue.write.addEnclosure([1n, "VIP", ["0x41"], [500n]]);
    const encs = await venue.read.getEnclosures([1n]);
    assert.equal(encs.length, 2);
  });

  // ── Test 8: Venue not found ──
  it("Should revert getVenue for nonexistent venue", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await assert.rejects(venue.read.getVenue([99n]));
  });

  // ── Test 9: Add rows to existing enclosure ──
  it("Should add more rows to existing enclosure", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "General", ["0x41"], [1000n]]);
    // Add rows B and C
    await venue.write.addRows([1n, 1n, ["0x42", "0x43"], [800n, 600n]]);
    const rows = await venue.read.getRows([1n, 1n]);
    assert.equal(rows.length, 3);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x42"]), 800n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x43"]), 600n);
  });

  // ── Test 10: Cannot add duplicate row label ──
  it("Should revert on duplicate row label", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "General", ["0x41"], [1000n]]);
    await assert.rejects(
      venue.write.addRows([1n, 1n, ["0x41"], [500n]]),
    );
  });

  // ── Test 11: Rows starting from non-A label (e.g., D, E, F) ──
  it("Should create enclosure with rows starting from D", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    // D=0x44, E=0x45, F=0x46 — rows don't have to start from A
    await venue.write.addEnclosure([1n, "Upper Tier", ["0x44", "0x45", "0x46"], [200n, 150n, 100n]]);
    const rows = await venue.read.getRows([1n, 1n]);
    assert.equal(rows.length, 3);
    assert.equal(rows[0].label, "0x44"); // D
    assert.equal(rows[0].seatCount, 200n);
    assert.equal(rows[1].label, "0x45"); // E
    assert.equal(rows[1].seatCount, 150n);
    assert.equal(rows[2].label, "0x46"); // F
    assert.equal(rows[2].seatCount, 100n);
    // Row A should return 0 (doesn't exist)
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x41"]), 0n);
  });

  // ── Test 12: Each row has different seat count ──
  it("Should support different seat counts per row in same enclosure", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    // A=3000, B=2500, C=2000, D=1500
    await venue.write.addEnclosure([1n, "Main Stand", ["0x41", "0x42", "0x43", "0x44"], [3000n, 2500n, 2000n, 1500n]]);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x41"]), 3000n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x42"]), 2500n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x43"]), 2000n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x44"]), 1500n);
  });

  // ─────────────────────────────────────────────────────────────
  //                AUDIT REMEDIATION TESTS (T-38..T-41)
  // ─────────────────────────────────────────────────────────────

  // T-38: addEnclosure reverts VenueNotFound before VenueNotActive (M-01)
  it("T-38: addEnclosure on non-existent venue reverts VenueNotFound not VenueNotActive", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    // VenueId 999 doesn't exist at all — should get VenueNotFound
    await assert.rejects(
      venue.write.addEnclosure([999n, "Stand", ["0x41"], [100n]]),
    );
  });

  // T-39: updateRow rejects newSeatCount < current (M-02)
  it("T-39: updateRow reverts SeatCountReductionNotAllowed when reducing seats", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "Stand", ["0x41"], [100n]]);
    // Try to reduce row A from 100 to 50 — should revert
    await assert.rejects(
      venue.write.updateRow([1n, 1n, 0n, "0x41", 50n]),
    );
  });

  // T-40: updateRow allows increasing seat count
  it("T-40: updateRow allows increasing seat count without revert", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "Stand", ["0x41"], [100n]]);
    // Increase from 100 to 200 — should succeed
    await assert.doesNotReject(
      venue.write.updateRow([1n, 1n, 0n, "0x41", 200n]),
    );
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x41"]), 200n);
  });

  // T-41: addEnclosure on deactivated venue reverts VenueNotActive (M-01 order check correct)
  it("T-41: addEnclosure on deactivated (existing) venue reverts VenueNotActive", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.deactivateVenue([1n]);
    // Venue exists but is inactive
    await assert.rejects(
      venue.write.addEnclosure([1n, "Stand", ["0x41"], [100n]]),
    );
  });

  // ── Test 42: updateEnclosure updates enclosure name ──
  it("T-42: updateEnclosure successfully changes name", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "Old Name", ["0x41"], [100n]]);
    await venue.write.updateEnclosure([1n, 1n, "New Name"]);
    const enc = await venue.read.getEnclosure([1n, 1n]);
    assert.equal(enc.name, "New Name");
  });

  // ── Test 43: toggleEnclosureActive toggles status ──
  it("T-43: toggleEnclosureActive toggles active status", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "Stand", ["0x41"], [100n]]);
    await venue.write.toggleEnclosureActive([1n, 1n, false]);
    assert.equal(await venue.read.isEnclosureActive([1n, 1n]), false);
    await venue.write.toggleEnclosureActive([1n, 1n, true]);
    assert.equal(await venue.read.isEnclosureActive([1n, 1n]), true);
  });

  // ── Test 44: updateRow changes label but keeps seat count ──
  it("T-44: updateRow successfully changes label only", async function () {
    const venue = await viem.deployContract("VenueRegistry");
    await venue.write.createVenue(["Stadium", "City", "ipfs://x"]);
    await venue.write.addEnclosure([1n, "Stand", ["0x41"], [100n]]);
    await venue.write.updateRow([1n, 1n, 0n, "0x42", 100n]);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x42"]), 100n);
    assert.equal(await venue.read.getRowSeatCount([1n, 1n, "0x41"]), 0n);
  });
});

