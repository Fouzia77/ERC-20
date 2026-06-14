const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20 Token Faucet", function () {
  let token, faucet;
  let owner, user1, user2;

  const FAUCET_AMOUNT = ethers.utils.parseEther("100");
  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FaucetToken");
    token = await Token.deploy();
    await token.deployed();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(token.address);
    await faucet.deployed();

    await token.connect(owner).setMinter(faucet.address);
  });

  it("allows a user to claim tokens successfully", async function () {
    await faucet.connect(user1).requestTokens();
    const bal = await token.balanceOf(user1.address);
    expect(bal.toString()).to.equal(FAUCET_AMOUNT.toString());
  });

  it("enforces 24-hour cooldown", async function () {
    await faucet.connect(user1).requestTokens();

    try {
      await faucet.connect(user1).requestTokens();
      expect.fail("Cooldown not enforced");
    } catch (err) {
      expect(err.message).to.include("Cooldown period not elapsed");
    }

    await ethers.provider.send("evm_increaseTime", [DAY]);
    await ethers.provider.send("evm_mine");

    await faucet.connect(user1).requestTokens();
    const bal = await token.balanceOf(user1.address);
    expect(bal.toString()).to.equal(
      FAUCET_AMOUNT.mul(2).toString()
    );
  });
  it("enforces lifetime claim limit", async function () {
  for (let i = 0; i < 10; i++) {
    await faucet.connect(user1).requestTokens();
    await ethers.provider.send("evm_increaseTime", [DAY]);
    await ethers.provider.send("evm_mine");
  }

  try {
    await faucet.connect(user1).requestTokens();
    expect.fail("Lifetime limit not enforced");
  } catch (err) {
    // Accept both Hardhat revert formats
    expect(
      err.message.includes("Lifetime claim limit reached") ||
      err.message.includes("VM Exception")
    ).to.equal(true);
  }
});


  it("allows admin to pause and unpause the faucet", async function () {
    await faucet.connect(owner).setPaused(true);

    try {
      await faucet.connect(user1).requestTokens();
      expect.fail("Pause not enforced");
    } catch (err) {
      expect(err.message).to.include("Faucet is paused");
    }

    await faucet.connect(owner).setPaused(false);
    await faucet.connect(user1).requestTokens();

    const bal = await token.balanceOf(user1.address);
    expect(bal.toString()).to.equal(FAUCET_AMOUNT.toString());
  });

  it("prevents non-admin from pausing faucet", async function () {
    try {
      await faucet.connect(user1).setPaused(true);
      expect.fail("Non-admin pause allowed");
    } catch (err) {
      expect(err.message).to.include("Only admin can pause");
    }
  });

  it("allows multiple users to claim independently", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    const b1 = await token.balanceOf(user1.address);
    const b2 = await token.balanceOf(user2.address);

    expect(b1.toString()).to.equal(FAUCET_AMOUNT.toString());
    expect(b2.toString()).to.equal(FAUCET_AMOUNT.toString());
  });
});