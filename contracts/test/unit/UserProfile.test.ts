import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";

describe("UserProfile", async function () {
  const { viem } = await network.connect();
  const [user1, user2] = await viem.getWalletClients();

  // ── Test 1: Set profile hash ──
  it("Should set profile hash", async function () {
    const profile = await viem.deployContract("UserProfile");
    const hash = keccak256(toHex("John Doe|john@test.com|03001234567"));
    await profile.write.setProfileHash([hash]);
    assert.equal(await profile.read.hasCompleteProfile([user1.account.address]), true);
  });

  // ── Test 2: No profile by default ──
  it("Should return false for user without profile", async function () {
    const profile = await viem.deployContract("UserProfile");
    assert.equal(await profile.read.hasCompleteProfile([user2.account.address]), false);
  });

  // ── Test 3: Remove profile ──
  it("Should remove profile hash", async function () {
    const profile = await viem.deployContract("UserProfile");
    const hash = keccak256(toHex("data"));
    await profile.write.setProfileHash([hash]);
    assert.equal(await profile.read.hasCompleteProfile([user1.account.address]), true);
    await profile.write.removeProfileHash();
    assert.equal(await profile.read.hasCompleteProfile([user1.account.address]), false);
  });

  // ── Test 4: Update profile hash ──
  it("Should update profile hash", async function () {
    const profile = await viem.deployContract("UserProfile");
    const hash1 = keccak256(toHex("data1"));
    const hash2 = keccak256(toHex("data2"));
    await profile.write.setProfileHash([hash1]);
    assert.equal(await profile.read.profileHashes([user1.account.address]), hash1);
    await profile.write.setProfileHash([hash2]);
    assert.equal(await profile.read.profileHashes([user1.account.address]), hash2);
  });
});
