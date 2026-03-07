-- CreateTable
CREATE TABLE "superAdmins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "superAdmins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "superAdmins_userId_key" ON "superAdmins"("userId");

-- CreateIndex
CREATE INDEX "superAdmins_email_idx" ON "superAdmins"("email");

-- CreateIndex
CREATE INDEX "superAdmins_deletedAt_idx" ON "superAdmins"("deletedAt");

-- AddForeignKey
ALTER TABLE "superAdmins" ADD CONSTRAINT "superAdmins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
