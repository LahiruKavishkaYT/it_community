-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'WAITLIST');

-- AlterTable
ALTER TABLE "event_attendees" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "dietaryRestrictions" TEXT[],
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "AttendeeStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "agenda" TEXT,
ADD COLUMN     "alcoholicBeverages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dietaryRestrictions" TEXT[],
ADD COLUMN     "drinkDetails" TEXT,
ADD COLUMN     "eventFee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "eventUrl" TEXT,
ADD COLUMN     "foodDetails" TEXT,
ADD COLUMN     "isVirtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prerequisites" TEXT[],
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "registrationInstructions" TEXT,
ADD COLUMN     "requireApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiredFields" TEXT[],
ADD COLUMN     "speakers" TEXT[],
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "virtualMeetingLink" TEXT;
