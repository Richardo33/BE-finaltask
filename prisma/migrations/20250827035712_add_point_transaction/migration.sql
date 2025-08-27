-- CreateTable
CREATE TABLE "finaltask"."PointTransaction" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "finaltask"."PointTransaction" ADD CONSTRAINT "PointTransaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "finaltask"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finaltask"."PointTransaction" ADD CONSTRAINT "PointTransaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "finaltask"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
