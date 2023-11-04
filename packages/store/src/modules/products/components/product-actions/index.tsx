import { useProductActions } from "@lib/context/product-context"
import useProductPrice from "@lib/hooks/use-product-price"
import { formatAmount, useCart } from "medusa-react"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { useProducts } from "medusa-react"
import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import OptionSelect from "@modules/products/components/option-select"
import clsx from "clsx"
import Link from "next/link"
import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { ProductOption } from "@medusajs/medusa"
import { findCheapestCurrencyPrice } from "@lib/util/prices"
import { Variant } from "types/medusa"

type ProductActionsProps = {
  product: PricedProduct
}

interface WindowCoveringProductFormData {
  window_width: number
  window_height: number
  [key: string]: unknown
}

const useProductOptionValueDict = (options: ProductOption[]) => {
  const productIds = options
    .flatMap((option) => option.values)
    .map(({ value }) => value)
    .filter((value) => value.startsWith("prod_"))
  const { products = [] } = useProducts({
    id: productIds,
  })
  const productMap = React.useMemo(
    () =>
      products.reduce(
        (acc, p) => (p?.id ? acc.set(p.id, p) : acc),
        new Map<string, PricedProduct>()
      ),
    [products]
  )
  return productMap
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const { cart } = useCart()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WindowCoveringProductFormData>({
    defaultValues: {},
  })
  const { updateOptions, addToCart, options, inStock, variant } =
    useProductActions()

  const productsById = useProductOptionValueDict(product.options || [])
  const price = useProductPrice({
    products: [
      { id: product.id!, variantId: variant?.id },
      ...Object.values(options)
        .filter((value) => value.startsWith("prod_"))
        .map((id) => ({ id })),
    ],
  })

  const selectedPrice = useMemo(() => {
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  return (
    <form
      onSubmit={handleSubmit((registeredFields) => {
        addToCart({
          ...registeredFields, // window width & height
          options: Object.entries(options).map(([option_id, option_value]) => ({
            option_id,
            option_value,
          })),
        })
      })}
      onReset={() => reset()}
      className="w-full"
    >
      <div className="flex flex-col gap-y-2">
        {product.collection && (
          <Link
            href={`/collections/${product.collection.handle}`}
            className="text-small-regular text-gray-700"
          >
            {product.collection.title}
          </Link>
        )}
        <h3 className="text-xl-regular">{product.title}</h3>

        <p className="text-base-regular">{product.description}</p>
        <Input
          label="Window Name ( i.e. Bedroom - Left )"
          {...register("window_name", {
            required: true,
          })}
          type="text"
          errors={errors}
        />
        <Input
          label="Window Width"
          {...register("window_width", {
            required: true,
            valueAsNumber: true,
            min: 0,
          })}
          type="number"
          defaultValue={0}
          errors={errors}
        />

        <Input
          label="Window Height"
          {...register("window_height", {
            required: true,
            valueAsNumber: true,
            min: 0,
          })}
          type="number"
          defaultValue={0}
          errors={errors}
        />
        <div className="my-8 flex flex-col gap-y-6">
          {(product.options || []).map((option) => {
            return (
              <div key={option.id}>
                <OptionSelect
                  optionValues={option.values.map((v) => {
                    const optionValueProductAddon = productsById.get(v.value)
                    const currencyPrice = findCheapestCurrencyPrice(
                      (productsById.get(v.value)?.variants as Variant[]) || [],
                      cart?.region?.currency_code!
                    )
                    const subtitle = currencyPrice?.amount
                      ? "+" +
                        formatAmount({
                          amount: currencyPrice.amount,
                          region: cart?.region!,
                          includeTaxes: false,
                        })
                      : ""
                    return {
                      ...v,
                      title: optionValueProductAddon?.title || v.value,
                      id: option.id,
                      subtitle,
                    }
                  })}
                  current={options[option.id]}
                  updateOption={updateOptions}
                  title={option.title}
                />
              </div>
            )
          })}
        </div>
        <div className="mb-4">
          {selectedPrice ? (
            <div className="flex flex-col text-gray-700">
              <span
                className={clsx("text-xl-semi", {
                  "text-rose-600": selectedPrice.price_type === "sale",
                })}
              >
                From {selectedPrice.calculated_price}
              </span>
              {selectedPrice.price_type === "sale" && (
                <>
                  <p>
                    <span className="text-gray-500">Original: </span>
                    <span className="line-through">
                      {selectedPrice.original_price}
                    </span>
                  </p>
                  <span className="text-rose-600">
                    -{selectedPrice.percentage_diff}%
                  </span>
                </>
              )}
            </div>
          ) : (
            <div></div>
          )}
        </div>

        <Button type="submit">
          {!inStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </form>
  )
}

export default ProductActions
