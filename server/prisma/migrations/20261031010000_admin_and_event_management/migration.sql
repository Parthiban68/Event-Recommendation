-- Additive migration: preserves existing event records.
-- Existing events remain published and are associated with the seeded admin later.

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- Extend Event
ALTER TABLE "Event"
    ADD COLUMN "seedKey" TEXT,
    ADD COLUMN "summary" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "bannerUrl" TEXT,
    ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC',
    ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN "createdById" UUID;

-- Drafts may omit scheduling and publication metadata.
ALTER TABLE "Event"
    ALTER COLUMN "eventDate" DROP NOT NULL,
    ALTER COLUMN "startTime" SET DEFAULT '',
    ALTER COLUMN "location" SET DEFAULT '',
    ALTER COLUMN "registrationUrl" SET DEFAULT '',
    ALTER COLUMN "description" SET DEFAULT '',
    ALTER COLUMN "category" SET DEFAULT '';

-- Normalise legacy array columns before enforcing defaults.
UPDATE "Event" SET "requiredSkills" = ARRAY[]::TEXT[] WHERE "requiredSkills" IS NULL;
UPDATE "Event" SET "interests" = ARRAY[]::TEXT[] WHERE "interests" IS NULL;
ALTER TABLE "Event"
    ALTER COLUMN "requiredSkills" SET DEFAULT ARRAY[]::TEXT[],
    ALTER COLUMN "requiredSkills" SET NOT NULL,
    ALTER COLUMN "interests" SET DEFAULT ARRAY[]::TEXT[],
    ALTER COLUMN "interests" SET NOT NULL;

-- Backfill a short summary for existing records.
UPDATE "Event" SET "summary" = LEFT("description", 240) WHERE "summary" = '';

-- New events default to draft; existing rows remain published.
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "Event_seedKey_key" ON "Event"("seedKey");
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "Admin"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
