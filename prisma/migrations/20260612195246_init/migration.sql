-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "bugs" JSONB NOT NULL,
    "improvements" JSONB NOT NULL,
    "quality" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
