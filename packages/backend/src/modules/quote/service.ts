import { MedusaError } from "@medusajs/framework/utils";
import { Money } from "src/types";
import { GetVariantQuoteStepInput } from "src/workflows/steps/get-quote";

/**
 * Calculates the price based on width, height, and a provided base price.
 * The formula grows proportionally from the base price.
 *
 * @param width - Width value
 * @param height - Height value
 * @param basePrice - Starting base price
 * @returns Calculated price
 */
export function calculateScaledPrice(
  basePrice: number,
  width: number,
  height: number
): number {
  const growthFactor =
    1 +
    0.00005 * width +
    0.00004 * height +
    0.00000002 * width * width +
    0.00000002 * height * height;

  const price = basePrice * growthFactor * 100;
  return Math.round(price); // Round for whole-number pricing
}

const fakeRequest = ({
  variant,
  metadata: { width, height },
}: GetVariantQuoteStepInput): Promise<Money> => {
  return Promise.resolve({
    units: calculateScaledPrice(
      variant.calculated_price!.calculated_amount,
      width,
      height
    ),
    currencyCode: "USD",
    denomination: 100,
  });
};

interface QuoteServiceOptions {
  accessToken?: string;
}

export interface WindowSpecifications {
  width: number;
  height: number;
}

export default class QuoteService {
  protected options_: QuoteServiceOptions;

  constructor({}, options: QuoteServiceOptions) {
    this.options_ = options;
  }
  async getQuote(quoteStepInput: GetVariantQuoteStepInput): Promise<Money> {
    if (!quoteStepInput.variant.calculated_price) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Variant does not have a calculated price"
      );
    }
    return fakeRequest(quoteStepInput);
  }
}
