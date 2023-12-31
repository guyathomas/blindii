import { MigrationInterface, QueryRunner } from "typeorm";

export class MoneyAmountMetadata1692752068999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "money_amount" ADD COLUMN "metadata" JSONB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "money_amount" DROP COLUMN "metadata"`
    );
  }
}
