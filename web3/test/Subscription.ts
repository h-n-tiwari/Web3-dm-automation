import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deploySubscriptionFixture() {
  const [deployer, owner, user] = await ethers.getSigners();
  const subscription = await ethers.deployContract(
    "Subscription",
    [owner.address],
    deployer,
  );
  await subscription.waitForDeployment();

  const price = await subscription.price();
  return { subscription, owner, user, price };
}

describe("Subscription", function () {
  it("activates the subscription after exact payment", async function () {
    const { subscription, user, price } = await networkHelpers.loadFixture(
      deploySubscriptionFixture,
    );

    expect(await subscription.isSubscribed(user.address)).to.equal(false);

    const payment = await subscription.connect(user).subscribe({ value: price });
    await payment.wait();

    expect(await subscription.isSubscribed(user.address)).to.equal(true);
  });

  it("rejects underpayment and overpayment", async function () {
    const { subscription, user, price } = await networkHelpers.loadFixture(
      deploySubscriptionFixture,
    );

    await expect(
      subscription.connect(user).subscribe({ value: price - 1n }),
    ).to.be.revertedWithCustomError(subscription, "IncorrectPayment");

    await expect(
      subscription.connect(user).subscribe({ value: price + 1n }),
    ).to.be.revertedWithCustomError(subscription, "IncorrectPayment");
  });

  it("allows only the owner to withdraw the full balance", async function () {
    const { subscription, owner, user, price } =
      await networkHelpers.loadFixture(deploySubscriptionFixture);

    const payment = await subscription.connect(user).subscribe({ value: price });
    await payment.wait();

    await expect(subscription.connect(user).withdraw())
      .to.be.revertedWithCustomError(subscription, "OwnableUnauthorizedAccount")
      .withArgs(user.address);

    const contractAddress = await subscription.getAddress();
    await expect(subscription.connect(owner).withdraw()).to.changeEtherBalances(
      ethers,
      [contractAddress, owner.address],
      [-price, price],
    );
  });
});