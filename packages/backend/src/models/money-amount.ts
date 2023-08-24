import { Entity } from "typeorm";
import {
  DbAwareColumn,
  MoneyAmount as MedusaMoneyAmount,
} from "@medusajs/medusa";

@Entity()
export class MoneyAmount extends MedusaMoneyAmount {
  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;
}
