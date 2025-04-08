-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SELLER');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "value" DECIMAL(20,2) NOT NULL,
    "payer_sender_id" TEXT NOT NULL,
    "payee_received_id" TEXT NOT NULL,
    "from_cpf_cnpj" TEXT NOT NULL,
    "to_cpf_cnpj" TEXT NOT NULL,
    "to_phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "walletBalance" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_cnpj_key" ON "users"("cpf_cnpj");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payer_sender_id_fkey" FOREIGN KEY ("payer_sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
