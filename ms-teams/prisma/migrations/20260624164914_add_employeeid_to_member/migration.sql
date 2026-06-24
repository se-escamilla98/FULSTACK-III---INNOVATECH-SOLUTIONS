-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
