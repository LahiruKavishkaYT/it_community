-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "architecture" TEXT,
ADD COLUMN     "keyFeatures" TEXT[],
ADD COLUMN     "learningObjectives" TEXT[];
