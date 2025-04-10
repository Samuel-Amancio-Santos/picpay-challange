/*
  Warnings:

  - You are about to drop the column `from_cpf_cnpj` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `to_cpf_cnpj` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `to_phone` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "from_cpf_cnpj",
DROP COLUMN "to_cpf_cnpj",
DROP COLUMN "to_phone";
