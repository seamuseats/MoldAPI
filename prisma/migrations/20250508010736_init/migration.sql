-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "discordid" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "place" INTEGER NOT NULL,
    "video" TEXT,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LevelToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LevelToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordid_key" ON "User"("discordid");

-- CreateIndex
CREATE UNIQUE INDEX "Level_place_key" ON "Level"("place");

-- CreateIndex
CREATE INDEX "_LevelToUser_B_index" ON "_LevelToUser"("B");

-- AddForeignKey
ALTER TABLE "_LevelToUser" ADD CONSTRAINT "_LevelToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LevelToUser" ADD CONSTRAINT "_LevelToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
