-- CreateTable
CREATE TABLE "ApiKey" (
    "key" TEXT NOT NULL,
    "userId" INTEGER,
    "expirationDate" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
