-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROJECT_SUBMITTED', 'PROJECT_APPROVED', 'PROJECT_REJECTED', 'PROJECT_NEEDS_APPROVAL', 'SYSTEM_MESSAGE', 'USER_WELCOME', 'ADMIN_ALERT');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "userId" TEXT,
    "itemId" TEXT,
    "itemType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailSystemMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailAdminMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pushSystemMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushAdminMessages" BOOLEAN NOT NULL DEFAULT true,
    "inAppProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
    "inAppSystemMessages" BOOLEAN NOT NULL DEFAULT true,
    "inAppAdminMessages" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'immediate',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_userId_key" ON "user_notification_settings"("userId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
