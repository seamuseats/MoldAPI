-- CreateEnum
CREATE TYPE "Demon" AS ENUM ('EXTREME', 'INSANE', 'HARD', 'MEDIUM', 'EASY');

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "difficulty" "Demon" NOT NULL DEFAULT 'EASY';
