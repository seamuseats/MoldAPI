-- DropIndex
DROP INDEX "Level_place_key";

-- AlterTable
CREATE SEQUENCE level_place_seq;
ALTER TABLE "Level" ALTER COLUMN "place" SET DEFAULT nextval('level_place_seq');
ALTER SEQUENCE level_place_seq OWNED BY "Level"."place";
