-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" SERIAL NOT NULL,
    "base" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'exchangerateapi',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_base_target_key" ON "CurrencyRate"("base", "target");
