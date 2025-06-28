/*
  Warnings:

  - You are about to drop the column `metadata` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `lastNotificationCheck` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notificationSettings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `notification_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_senderId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastNotificationCheck",
DROP COLUMN "notificationSettings";

-- DropTable
DROP TABLE "notification_preferences";

-- DropTable
DROP TABLE "notifications";

-- DropEnum
DROP TYPE "NotificationPriority";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateTable
CREATE TABLE "career_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "skills" TEXT[],
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "demandLevel" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_path_milestones" (
    "id" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "resources" TEXT[],
    "estimatedTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_path_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_career_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "currentPhase" TEXT,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_career_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_career_progress_userId_careerPathId_key" ON "user_career_progress"("userId", "careerPathId");

-- AddForeignKey
ALTER TABLE "career_path_milestones" ADD CONSTRAINT "career_path_milestones_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_progress" ADD CONSTRAINT "user_career_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_progress" ADD CONSTRAINT "user_career_progress_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
