import { Product } from "@medusajs/medusa"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { sumBy } from "lodash"
import { formatAmount, useCart, useProducts } from "medusa-react"
import { useEffect, useMemo } from "react"
import { CalculatedVariant } from "types/medusa"

type useProductPriceProps = {
  products: { id: string; variantId?: string }[]
}

export const getPercentageDiff = (original: number, calculated: number) => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed()
}

const getCheapestPriceFromProduct = (product: PricedProduct) => {
  if (!product || !product.variants?.length) return null

  const variants = product.variants as unknown as CalculatedVariant[]

  const cheapestVariant = variants.reduce((prev, curr) => {
    return prev.calculated_price < curr.calculated_price ? prev : curr
  })
  return {
    calculated_price: cheapestVariant.calculated_price,
    original_price: cheapestVariant.original_price,
    price_type: cheapestVariant.calculated_price_type,
  }
}

const useProductPrice = ({
  products: sourceProduct = [],
}: useProductPriceProps) => {
  const { cart } = useCart()
  const {
    products = [],
    isLoading,
    isError,
    refetch,
  } = useProducts(
    {
      id: sourceProduct.map((p) => p.id),
      cart_id: cart?.id,
    },
    { enabled: !!cart?.id && !!cart?.region_id }
  )

  useEffect(() => {
    if (cart?.region_id) {
      refetch()
    }
  }, [cart?.region_id, refetch])

  const cheapestPrices = useMemo(() => {
    return products
      .map((product) => getCheapestPriceFromProduct(product))
      .filter(Boolean)
  }, [products, cart?.region])

  const variantPrices = useMemo(() => {
    const productToVariantIdMap = sourceProduct.reduce(
      (acc, p) => acc.set(p.id, p.variantId),
      new Map()
    )
    return products
      .map((product) => {
        const variantIdForProduct = productToVariantIdMap.get(product.id)
        if (!product || !variantIdForProduct || !cart?.region) {
          return null
        }

        const variant = product.variants.find(
          (v) => v.id === variantIdForProduct || v.sku === variantIdForProduct
        ) as unknown as CalculatedVariant

        if (!variant) return null

        return {
          calculated_price: variant.calculated_price,
          original_price: variant.original_price,
          price_type: variant.calculated_price_type,
        }
      })
      .filter(Boolean)
  }, [products, cart?.region])

  const cheapestPriceOriginal = sumBy(cheapestPrices, "original_price")
  const cheapestPriceCalculated = sumBy(cheapestPrices, "calculated_price")
  const variantPriceOriginal = sumBy(variantPrices, "original_price")
  const variantPriceCalculated = sumBy(variantPrices, "calculated_price")

  if (!cart?.region)
    return {
      products,
      cheapestPrice: null,
      variantPrice: null,
      isLoading,
      isError,
    }

  const variantPrice = variantPriceOriginal
    ? {
        calculated_price: formatAmount({
          amount: variantPriceCalculated,
          region: cart.region,
          includeTaxes: false,
        }),
        original_price: formatAmount({
          amount: variantPriceOriginal,
          region: cart.region,
          includeTaxes: false,
        }),
        price_type: variantPrices[0]?.price_type,
        percentage_diff: getPercentageDiff(
          variantPriceOriginal,
          variantPriceCalculated
        ),
      }
    : null
  return {
    products,
    cheapestPrice: {
      calculated_price: formatAmount({
        amount: cheapestPriceCalculated,
        region: cart.region,
        includeTaxes: false,
      }),
      original_price: formatAmount({
        amount: cheapestPriceOriginal,
        region: cart.region,
        includeTaxes: false,
      }),
      price_type: cheapestPrices[0]?.price_type,
      percentage_diff: getPercentageDiff(
        cheapestPriceOriginal,
        cheapestPriceCalculated
      ),
    },
    variantPrice,
    isLoading,
    isError,
  }
}

export default useProductPrice
