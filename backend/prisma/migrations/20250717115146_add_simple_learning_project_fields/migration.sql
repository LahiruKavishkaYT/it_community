/*
  Warnings:

  - You are about to drop the `career_path_suggestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suggestion_votes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "career_path_suggestions" DROP CONSTRAINT "career_path_suggestions_authorId_fkey";

-- DropForeignKey
ALTER TABLE "career_path_suggestions" DROP CONSTRAINT "career_path_suggestions_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "learning_projects" DROP CONSTRAINT "learning_projects_createdById_fkey";

-- DropForeignKey
ALTER TABLE "suggestion_votes" DROP CONSTRAINT "suggestion_votes_suggestionId_fkey";

-- DropForeignKey
ALTER TABLE "suggestion_votes" DROP CONSTRAINT "suggestion_votes_userId_fkey";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "difficultyLevel" TEXT,
ADD COLUMN     "estimatedTime" TEXT,
ADD COLUMN     "isLearningProject" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectCategory" TEXT;

-- DropTable
DROP TABLE "career_path_suggestions";

-- DropTable
DROP TABLE "learning_projects";

-- DropTable
DROP TABLE "suggestion_votes";

-- DropEnum
DROP TYPE "DifficultyLevel";

-- DropEnum
DROP TYPE "SuggestionStatus";

-- DropEnum
DROP TYPE "SuggestionType";
