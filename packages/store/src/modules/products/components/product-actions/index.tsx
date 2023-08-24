import { useProductActions } from "@lib/context/product-context"
import useProductPrice from "@lib/hooks/use-product-price"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import OptionSelect from "@modules/products/components/option-select"
import clsx from "clsx"
import Link from "next/link"
import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Product } from "types/medusa"

type ProductActionsProps = {
  product: PricedProduct
}

interface WindowCoveringProductFormData {
  window_width: number
  window_height: number
  [key: string]: unknown
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
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

  const price = useProductPrice({ id: product.id!, variantId: variant?.id })

  const selectedPrice = useMemo(() => {
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  return (
    <form
      onSubmit={handleSubmit(addToCart)}
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

        {product.variants.length > 1 && (
          <div className="my-8 flex flex-col gap-y-6">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={updateOptions}
                    title={option.title}
                  />
                </div>
              )
            })}
          </div>
        )}

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
