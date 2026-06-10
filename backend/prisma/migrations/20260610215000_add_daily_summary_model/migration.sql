-- CreateTable
CREATE TABLE "DailySummary" (
    "date" TIMESTAMP(3) NOT NULL,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "totalDebits" INTEGER NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "activeWallets" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("date")
);
