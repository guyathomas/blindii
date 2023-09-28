import React from "react";
import type { ProductDetailsWidgetProps } from "@medusajs/admin";
import { useAdminProducts } from "medusa-react";
import ProductOptionTable from "./product-option-table";
import OptionsModal from "./edit-product-options-modal";

const ProductDetailsAfter = ({
  product,
  notify,
}: ProductDetailsWidgetProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const { products } = useAdminProducts({
    id: product?.id,
    expand: "options,options.values",
  });
  const detailedProduct = products?.[0];

  if (!detailedProduct) return null;

  return (
    <>
      {isEditing && (
        <OptionsModal
          open={isEditing}
          onClose={() => {
            setIsEditing(false);
          }}
          onSuccess={(message: string) => {
            notify.success("Success", message);
          }}
          onError={(message: string) => {
            notify.error("Error", message);
          }}
          productOptions={detailedProduct.options}
          productId={detailedProduct.id}
        />
      )}
      <div className="px-xlarge pt-large pb-xlarge rounded-rounded bg-grey-0 border-grey-20 border">
        <h1 className="text-grey-90 inter-xlarge-semibold flex items-center">
          {"Product Options"}
          <button
            onClick={() => {
              setIsEditing(true);
            }}
            className="ml-auto btn btn-secondary btn-small"
          >
            Edit
          </button>
        </h1>

        <div className="pt-base">
          <ProductOptionTable
            productOptions={detailedProduct.options}
            productId={detailedProduct.id}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetailsAfter;

export const config = {};
