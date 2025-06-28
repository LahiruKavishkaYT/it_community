/*
  Warnings:

  - You are about to drop the `career_path_milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `career_paths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_career_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "career_path_milestones" DROP CONSTRAINT "career_path_milestones_careerPathId_fkey";

-- DropForeignKey
ALTER TABLE "user_career_progress" DROP CONSTRAINT "user_career_progress_careerPathId_fkey";

-- DropForeignKey
ALTER TABLE "user_career_progress" DROP CONSTRAINT "user_career_progress_userId_fkey";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "approvalNotes" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "career_path_milestones";

-- DropTable
DROP TABLE "career_paths";

-- DropTable
DROP TABLE "user_career_progress";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
