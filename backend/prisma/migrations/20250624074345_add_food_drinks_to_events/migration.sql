/*
  Warnings:

  - You are about to drop the column `accessibilityNeeds` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryRestrictions` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `experienceLevel` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `motivation` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `studyField` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `techInterests` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `event_attendees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_attendees" DROP COLUMN "accessibilityNeeds",
DROP COLUMN "dietaryRestrictions",
DROP COLUMN "email",
DROP COLUMN "experienceLevel",
DROP COLUMN "fullName",
DROP COLUMN "motivation",
DROP COLUMN "phoneNumber",
DROP COLUMN "studyField",
DROP COLUMN "techInterests",
DROP COLUMN "university";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "drinksProvided" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "foodProvided" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "DietaryRestriction";

-- DropEnum
DROP TYPE "ExperienceLevel";
