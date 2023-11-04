import { ProductVariantService } from "@medusajs/medusa";

import defaultCreateLineItem from "@medusajs/medusa/dist/api/routes/store/carts/create-line-item";
import windowCreateLineItem from "./handle-line-item-transaction";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: cart_id } = req.params;

  // Check whether we need to follow the original flow or not
  // Window coverings have special pricing rules and validation
  const productVariantService: ProductVariantService = req.scope.resolve(
    "productVariantService"
  );

  const product = await productVariantService.retrieve(req.params?.variant_id, {
    cart_id,
    relations: ["product.type"],
  });

  if (product.product.type.value === "Window Covering") {
    windowCreateLineItem(req, res);
  } else {
    defaultCreateLineItem(req, res);
  }
};
