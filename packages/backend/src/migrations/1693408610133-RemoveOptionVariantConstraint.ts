import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOptionVariantConstraint1693408610133
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE product_option_value ALTER COLUMN variant_id DROP NOT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE product_option_value ALTER COLUMN variant_id SET NOT NULL;`
    );
  }
}
