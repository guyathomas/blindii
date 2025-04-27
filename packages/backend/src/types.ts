/**
 * Represents a monetary value along with its corresponding currency.
 *
 * The monetary value is expressed in the smallest indivisible unit of the currency.
 * For example, for USD this might represent cents, while for currencies without fractional
 * units, it represents the whole unit.
 *
 * @typedef {Object} Money
 * @property {number} units - The monetary amount in the smallest unit of the currency.
 * @property {string} currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR') indicating the currency.
 */

import { MedusaError } from "@medusajs/framework/utils";

export const CURRENCY_VALUES = ["USD", "EUR", "AUD"] as const;
export type SupportedCurrencies = (typeof CURRENCY_VALUES)[number];
export const supportedCurrencySet: Set<SupportedCurrencies> = new Set(
  CURRENCY_VALUES
);

export interface Money {
  units: number;
  currencyCode: SupportedCurrencies;
  denomination: number;
}

export function getMoneyAmount(money: Money): number {
  if (!supportedCurrencySet.has(money.currencyCode)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unsupported currency code: ${money.currencyCode}`
    );
  }
  return money.units / money.denomination;
}
