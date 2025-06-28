/*
  Warnings:

  - Added the required column `email` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceLevel` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyField` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `university` to the `event_attendees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DietaryRestriction" AS ENUM ('NONE', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "event_attendees" ADD COLUMN     "accessibilityNeeds" TEXT,
ADD COLUMN     "dietaryRestrictions" "DietaryRestriction",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "studyField" TEXT NOT NULL,
ADD COLUMN     "techInterests" TEXT,
ADD COLUMN     "university" TEXT NOT NULL;
