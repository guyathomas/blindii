import type { ProductDetailsWidgetProps } from "@medusajs/admin";
import { useAdminProducts } from "medusa-react";
import VariantTable from "./variant-table";

const ProductDetailsAfter = ({
  product,
  notify,
}: ProductDetailsWidgetProps) => {
  const { products } = useAdminProducts({
    id: product?.id,
    expand: "variants,options,options.values",
  });
  const detailedProduct = products?.[0];

  return (
    <div className="px-xlarge pt-large pb-xlarge rounded-rounded bg-grey-0 border-grey-20 border">
      <h1 className="text-grey-90 inter-xlarge-semibold">Variant Options</h1>
      <div className="pt-base">
        {detailedProduct?.variants?.map((variant) => (
          <VariantTable
            productOptions={detailedProduct?.options}
            variant={variant}
            key={variant.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsAfter;
