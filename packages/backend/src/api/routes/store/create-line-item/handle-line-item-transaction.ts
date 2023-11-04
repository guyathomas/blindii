import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Equals,
} from "class-validator";
import { Type } from "class-transformer";
import { EntityManager } from "typeorm";
import { IdempotencyKey, ProductVariantService } from "@medusajs/medusa";
import { validator } from "@medusajs/medusa/dist/utils/validator";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import {
  initializeIdempotencyRequest,
  runIdempotencyStep,
  RunIdempotencyStepOptions,
} from "@medusajs/medusa/dist/utils/idempotency";
import { cleanResponseData } from "@medusajs/medusa/dist/utils/clean-response-data";
import { handleAddOrUpdateLineItem } from "./create-window-line-item";

const CreateLineItemSteps = {
  STARTED: "started",
  FINISHED: "finished",
};

const handleTransaction = async (
  req: MedusaRequest,
  res: MedusaResponse,
  callback: (manager: EntityManager) => Promise<any>
): Promise<IdempotencyKey> => {
  const manager: EntityManager = req.scope.resolve("manager");

  let idempotencyKey: IdempotencyKey;
  try {
    idempotencyKey = await initializeIdempotencyRequest(req, res);
  } catch {
    res.status(409).send("Failed to create idempotency key");
    return;
  }

  let inProgress = true;
  let err: unknown = false;

  const stepOptions: RunIdempotencyStepOptions = {
    manager,
    idempotencyKey,
    container: req.scope,
    isolationLevel: "SERIALIZABLE",
  };
  while (inProgress) {
    switch (idempotencyKey.recovery_point) {
      case CreateLineItemSteps.STARTED: {
        await runIdempotencyStep(
          ({ manager }) => callback(manager),
          stepOptions
        ).catch((e) => {
          inProgress = false;
          err = e;
        });
        break;
      }

      case CreateLineItemSteps.FINISHED: {
        inProgress = false;
        break;
      }
    }
  }

  if (err) throw err;

  return idempotencyKey;
};

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: cart_id } = req.params;
  const customerId = req.user?.customer_id;

  const validated = await validator(
    StorePostCartsCartWindowLineItemsReq,
    req.body
  );

  const idempotencyKey = await handleTransaction(
    req,
    res,
    async (manager) =>
      await handleAddOrUpdateLineItem(
        cart_id,
        {
          customer_id: customerId,
          metadata: validated.metadata,
          quantity: validated.quantity,
          variant_id: validated.variant_id,
        },
        {
          manager,
          container: req.scope,
        }
      )
  );

  if (idempotencyKey.response_body.cart) {
    idempotencyKey.response_body.cart = cleanResponseData(
      idempotencyKey.response_body.cart,
      []
    );
  }

  res.status(idempotencyKey.response_code).json(idempotencyKey.response_body);
};

class ProductOptionSelection {
  @IsString()
  option_id: string;

  @IsString()
  option_value: string;
}

export class BlindOrCurtainMetadata {
  @IsString()
  window_name: string;

  @Min(0)
  @IsInt()
  window_width: number;

  @Min(0)
  @IsInt()
  window_height: number;

  @IsArray()
  @IsOptional()
  @Type(() => ProductOptionSelection)
  @ValidateNested({ each: true })
  options?: ProductOptionSelection[];
}

export class StorePostCartsCartWindowLineItemsReq {
  @IsString()
  variant_id: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BlindOrCurtainMetadata)
  metadata: BlindOrCurtainMetadata;
}
