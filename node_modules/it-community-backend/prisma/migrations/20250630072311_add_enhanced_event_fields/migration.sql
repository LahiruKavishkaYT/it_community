/*
  Warnings:

  - Added the required column `startDateTime` to the `events` table without a default value. This is not possible if the table is not empty.
  - Made the column `registrationDeadline` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ONSITE', 'VIRTUAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'EVENT_APPROVED';
ALTER TYPE "ActivityType" ADD VALUE 'EVENT_REJECTED';
ALTER TYPE "ActivityType" ADD VALUE 'JOB_APPROVED';
ALTER TYPE "ActivityType" ADD VALUE 'JOB_REJECTED';
ALTER TYPE "ActivityType" ADD VALUE 'APPLICATION_STATUS_UPDATED';

-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'RECRUITMENT_DRIVE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'EVENT_NOTIFICATION';
ALTER TYPE "NotificationType" ADD VALUE 'JOB_NOTIFICATION';
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_UPDATE';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "foodAndDrinksProvided" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationType" "LocationType" NOT NULL DEFAULT 'ONSITE',
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "venue" TEXT,
ADD COLUMN     "virtualEventLink" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "registrationDeadline" SET NOT NULL;
