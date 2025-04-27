import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { MedusaError, QueryContext } from "@medusajs/framework/utils";
import {
  GetVariantQuoteStepInput,
  getVariantQuoteStep,
} from "./steps/get-quote";
import { transform } from "@medusajs/framework/workflows-sdk";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { getMoneyAmount } from "src/types";
import { CustomCartLineItemType } from "src/api/middlewares";

type AddCustomToCartWorkflowInput = {
  cart_id: string;
  item: CustomCartLineItemType;
};

export const addCustomToCartWorkflow = createWorkflow(
  "add-custom-to-cart",
  ({ cart_id, item }: AddCustomToCartWorkflowInput) => {
    console.trace("add-custom-to-cart workflow started");

    // @ts-ignore
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "currency_code"],
    });

    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: ["*", "options.*", "options.option.*", "calculated_price.*"],
      filters: {
        id: item.variant_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
      context: {
        calculated_price: QueryContext({
          currency_code: carts[0].currency_code,
        }),
      },
    }).config({ name: "retrieve-variant" });

    const price = getVariantQuoteStep({
      variant: variants[0],
      currencyCode: carts[0].currency_code,
      quantity: item.quantity,
      metadata: item.metadata,
    } as GetVariantQuoteStepInput);

    const itemToAdd = transform(
      {
        item,
        price,
      },
      (data) => [
        {
          ...data.item,
          unit_price: getMoneyAmount(data.price),
          metadata: data.item.metadata,
        },
      ]
    );

    addToCartWorkflow.runAsStep({
      input: {
        items: itemToAdd,
        cart_id,
      },
    });

    // @ts-ignore
    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "items.*"],
    }).config({ name: "refetch-cart" });

    return new WorkflowResponse({
      cart: updatedCarts[0],
    });
  }
);
