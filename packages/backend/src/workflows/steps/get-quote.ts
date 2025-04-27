import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";

import { ProductVariantDTO } from "@medusajs/framework/types";
import { QUOTE_MODULE } from "../../modules/quote";
import QuoteModuleService from "../../modules/quote/service";
import { CustomCartLineItemType } from "src/api/middlewares";

export type GetVariantQuoteStepInput = {
  variant: ProductVariantDTO & {
    calculated_price?: {
      calculated_amount: number;
    };
  };
  currencyCode: string;
  quantity?: number;
  metadata: CustomCartLineItemType["metadata"];
};

export const getVariantQuoteStep = createStep(
  "get-quote",
  async (stepInput: GetVariantQuoteStepInput, { container }) => {
    const quoteModuleService: QuoteModuleService =
      container.resolve(QUOTE_MODULE);

    const quote = await quoteModuleService.getQuote(stepInput);
    return new StepResponse(quote);
  }
);
