import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { StoreAddCartLineItem } from "@medusajs/medusa/api/store/carts/validators";
import { z } from "zod";

// Extend the StoreAddCartLineItem validator to only allow metadata with width and height properties
export const CustomCartLineItemValidator = StoreAddCartLineItem.extend({
  // Override the metadata field to require width and height
  // Accept strings and transform them to numbers
  metadata: z.object({
    width: z.union([
      z.string().transform((val) => parseInt(val, 10)),
      z.number(),
    ]),
    height: z.union([
      z.string().transform((val) => parseInt(val, 10)),
      z.number(),
    ]),
  }),
});

// Export the inferred type for use in other files
export type CustomCartLineItemType = z.infer<
  typeof CustomCartLineItemValidator
>;

export default defineMiddlewares({
  routes: [
    {
      // TODO: Should I block the regular line items? https://linear.app/blindii/issue/BLI-10/deprecate-or-restrict-cardsidline-items
      matcher: "/store/carts/:id/line-items-quote",
      method: "POST",
      middlewares: [validateAndTransformBody(CustomCartLineItemValidator)],
    },
  ],
});
