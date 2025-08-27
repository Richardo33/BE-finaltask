/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - Added the required column `profileImageUrl` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "finaltask"."Product" DROP COLUMN "image",
ADD COLUMN     "productImageUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "finaltask"."User" ADD COLUMN     "profileImageUrl" TEXT NOT NULL;
