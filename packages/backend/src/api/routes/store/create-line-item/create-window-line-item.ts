import { AwilixContainer } from "awilix";
import {
  Cart,
  CartService,
  LineItemService,
  defaultStoreCartFields,
  defaultStoreCartRelations,
  WithRequiredProperty,
} from "@medusajs/medusa";

import { FlagRouter } from "@medusajs/utils";
import { EntityManager } from "typeorm";
import { IdempotencyCallbackResult } from "@medusajs/medusa/dist/types/idempotency-key";
import PricingService from "src/services/pricing";
import { BlindOrCurtainMetadata } from "./handle-line-item-transaction";

export async function handleAddOrUpdateLineItem(
  cartId: string,
  data: {
    metadata: BlindOrCurtainMetadata;
    customer_id?: string;
    variant_id: string;
    quantity: number;
  },
  { container, manager }: { container: AwilixContainer; manager: EntityManager }
): Promise<IdempotencyCallbackResult> {
  const cartService: CartService = container.resolve("cartService");
  const lineItemService: LineItemService = container.resolve("lineItemService");
  const featureFlagRouter: FlagRouter = container.resolve("featureFlagRouter");

  const pricingService: PricingService = container.resolve("pricingService");
  const txCartService = cartService.withTransaction(manager);

  let cart = await txCartService.retrieve(cartId, {
    select: ["id", "region_id", "customer_id"],
  });

  const variantPricing = await pricingService.getProductVariantPricingWithMeta(
    {
      variantId: data.variant_id,
      quantity: data.quantity,
      metadata: data.metadata,
    },
    {
      region_id: cart.region_id,
      customer_id: cart.customer_id,
      include_discount_prices: true,
    }
  );

  const addonPrices = await Promise.all(
    data.metadata.options
      ?.filter(({ option_id, option_value }) =>
        option_value.startsWith("prod_")
      )
      .map(({ option_value }) =>
        pricingService.getProductPricingById(option_value, {
          quantity: 1,
          cart_id: cart.id,
          region_id: cart.region_id,
        })
      ) || []
  );

  const totalAddonPrice = addonPrices
    .map((addonPrice) =>
      Object.entries(addonPrice).map(([variantId, pricing]) => pricing)
    )
    .flat()
    .reduce(
      (acc, { calculated_price }) =>
        acc + (typeof calculated_price === "number" ? calculated_price : 0),
      0
    );

  console.log(
    "zzz addons",
    await Promise.all(
      data.metadata.options
        ?.filter(({ option_id, option_value }) =>
          option_value.startsWith("prod_")
        )
        .map(({ option_value }) =>
          pricingService.getProductPricingById(option_value, {
            quantity: 1,
            cart_id: cart.id,
            region_id: cart.region_id,
          })
        ) || []
    )
  );

  const line = await lineItemService
    .withTransaction(manager)
    .generate(data.variant_id, cart.region_id, data.quantity, {
      customer_id: data.customer_id || cart.customer_id,
      metadata: data.metadata,
      unit_price: variantPricing.calculated_price + totalAddonPrice,
    });

  await txCartService.addOrUpdateLineItems(cart.id, line, {
    validateSalesChannels: featureFlagRouter.isFeatureEnabled("sales_channels"),
  });

  cart = await txCartService.retrieveWithTotals(cart.id, {
    select: defaultStoreCartFields,
    relations: [
      ...defaultStoreCartRelations,
      "billing_address",
      "region.payment_providers",
      "payment_sessions",
      "customer",
    ],
  });

  if (cart.payment_sessions?.length) {
    await txCartService.setPaymentSessions(
      cart as WithRequiredProperty<Cart, "total">
    );
  }

  return {
    response_code: 200,
    response_body: { cart },
  };
}
