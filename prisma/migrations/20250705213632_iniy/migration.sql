-- AlterTable
ALTER TABLE `drinks` ADD COLUMN `esgotado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `esgotando` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `novidade` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `observacao` VARCHAR(191) NULL;
