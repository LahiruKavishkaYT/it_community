-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('STUDENT_PROJECT', 'PRACTICE_PROJECT');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "projectType" "ProjectType" NOT NULL DEFAULT 'STUDENT_PROJECT';
