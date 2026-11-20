-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "exchange_rate" DECIMAL(20,10),
ADD COLUMN     "rate_provider" TEXT,
ADD COLUMN     "rate_timestamp" TIMESTAMPTZ(6);
