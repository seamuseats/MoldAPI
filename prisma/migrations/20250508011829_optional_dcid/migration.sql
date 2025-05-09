-- DropIndex
DROP INDEX "User_discordid_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "discordid" DROP NOT NULL;
