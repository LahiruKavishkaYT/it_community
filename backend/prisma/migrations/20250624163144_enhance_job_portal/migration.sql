/*
  Warnings:

  - You are about to drop the column `salary` on the `jobs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'LEAD_LEVEL', 'EXECUTIVE');

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "expectedSalary" INTEGER,
ADD COLUMN     "interviewedAt" TIMESTAMP(3),
ADD COLUMN     "offeredAt" TIMESTAMP(3),
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "rating" SMALLINT,
ADD COLUMN     "recruiterNotes" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "relocatable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "shortlistedAt" TIMESTAMP(3),
ADD COLUMN     "skillsMatchScore" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "salary",
ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "benefits" TEXT[],
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "equity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expectedStartDate" TIMESTAMP(3),
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'MID_LEVEL',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hybrid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "interviewProcess" TEXT,
ADD COLUMN     "jobFunction" TEXT,
ADD COLUMN     "onSite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredSkills" TEXT[],
ADD COLUMN     "reportingTo" TEXT,
ADD COLUMN     "requiredSkills" TEXT[],
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'USD',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "salaryPeriod" TEXT DEFAULT 'yearly',
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "teamSize" TEXT,
ADD COLUMN     "technologies" TEXT[],
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "job_bookmarks" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_bookmarks_jobId_userId_key" ON "job_bookmarks"("jobId", "userId");

-- AddForeignKey
ALTER TABLE "job_bookmarks" ADD CONSTRAINT "job_bookmarks_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_bookmarks" ADD CONSTRAINT "job_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
