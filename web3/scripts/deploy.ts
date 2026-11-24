import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer account configured for this network.");
  }

  const { chainId } = await ethers.provider.getNetwork();
  console.log("Chain ID:", chainId.toString());
  console.log("Deploying with account:", deployer.address);

  const Subscription = await ethers.getContractFactory("Subscription", deployer);
  const subscription = await Subscription.deploy(deployer.address);
  await subscription.waitForDeployment();

  console.log("Subscription deployed to:", await subscription.getAddress());
  console.log("Initial owner:", await subscription.owner());
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});