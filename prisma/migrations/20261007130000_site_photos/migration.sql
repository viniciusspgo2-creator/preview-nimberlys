CREATE TABLE "SitePhoto" (
 "id" TEXT NOT NULL, "original" TEXT, "caption" TEXT NOT NULL, "alt" TEXT NOT NULL,
 "gallery" BOOLEAN NOT NULL DEFAULT true, "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
 "data" BYTEA, "version" TEXT NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SitePhoto_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SitePhoto_original_key" ON "SitePhoto"("original");
