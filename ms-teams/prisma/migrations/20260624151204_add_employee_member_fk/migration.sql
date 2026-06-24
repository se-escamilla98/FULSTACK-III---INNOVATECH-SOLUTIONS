/*
  Warnings:

  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rut]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rut` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "email",
ADD COLUMN     "rut" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_rut_key" ON "Employee"("rut");
