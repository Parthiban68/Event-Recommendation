-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "interests" TEXT[],
    "eventDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "location" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "registrationUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_title_key" ON "Event"("title");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "Event_isOnline_idx" ON "Event"("isOnline");

-- CreateIndex
CREATE INDEX "Event_eventDate_isOnline_idx" ON "Event"("eventDate", "isOnline");
