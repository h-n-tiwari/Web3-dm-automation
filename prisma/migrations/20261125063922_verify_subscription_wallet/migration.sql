/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verifiedWalletAddress]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "walletAddress",
ADD COLUMN     "verifiedWalletAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_verifiedWalletAddress_key" ON "Subscription"("verifiedWalletAddress");
