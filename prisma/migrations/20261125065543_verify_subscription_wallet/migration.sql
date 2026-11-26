/*
  Warnings:

  - You are about to drop the column `verifiedWalletAddress` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subscription_verifiedWalletAddress_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "verifiedWalletAddress",
ADD COLUMN     "walletAddress" TEXT;
