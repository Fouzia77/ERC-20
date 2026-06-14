const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.getBalance()).toString()
  );

  // Deploy Token
  const Token = await hre.ethers.getContractFactory("FaucetToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Deploy Faucet
  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(token.address);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Set faucet as minter
  const tx = await token.setMinter(faucet.address);
  await tx.wait();
  console.log("Faucet set as token minter");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });