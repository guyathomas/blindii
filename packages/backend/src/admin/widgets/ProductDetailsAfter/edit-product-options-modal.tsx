import React from "react";
import { ProductOption, ProductVariant } from "@medusajs/medusa";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import differenceBy from "lodash/differenceBy";
import MedusaModal from "./medusa-modal";
import CreatableSelect from "react-select/creatable";
import { useAdminCustomPost } from "medusa-react";
import { AdminPostProductsProductOptionsOptionValuesReq } from "src/api/routes/admin/create-product-option-value";
import { AdminDeleteProductsProductOptionsOptionValuesReq } from "src/api/routes/admin/delete-product-option-value";

type Props = {
  productOptions: ProductOption[];
  open: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
  productId: string;
};
type OptionInput = { value: string; label: string; id?: string };
type OptionField = { id: string; title: string; values: OptionInput[] };
type OptionValuesForm = {
  productOptions: OptionField[];
};
type CreateOptionInput = { optionId: string; value: string };

const OptionValuesModal = ({
  productId,
  open,
  onSuccess,
  onClose,
  onError,
  productOptions,
}: Props) => {
  const { mutateAsync: createOptions } = useAdminCustomPost<
    AdminPostProductsProductOptionsOptionValuesReq,
    ProductVariant
  >(`/admin/option-value/bulk-create/${productId}`, ["create-option-value"], {
    product: true,
  });

  const { mutateAsync: deleteOptions } = useAdminCustomPost<
    AdminDeleteProductsProductOptionsOptionValuesReq,
    ProductVariant
  >(`/admin/option-value/bulk-delete/${productId}`, ["delete-option-value"], {
    product: true,
  });

  const defaultValues = React.useRef({
    productOptions: productOptions.map((option) => ({
      id: option.id,
      title: option.title,
      values: option.values.map(({ value, id }) => ({
        label: value,
        value: id,
        id,
      })),
    })),
  });
  const {
    control,
    formState: { isDirty },
    handleSubmit,
  } = useForm<OptionValuesForm>({
    defaultValues: defaultValues.current,
  });

  const { fields } = useFieldArray({
    name: "productOptions",
    control,
  });

  const onSubmit = handleSubmit(async (values) => {
    const allChanges = values.productOptions.reduce<{
      create: CreateOptionInput[];
      delete: CreateOptionInput[];
    }>(
      (acc, option) => {
        const valuesToCreate = option.values
          .filter((v) => !v.id) // Those that don't have an ID, must have been created
          .map((v) => ({
            optionId: option.id,
            value: v.value,
          }));
        const initialValuesForOption: OptionInput[] =
          defaultValues.current.productOptions.find((o) => o.id === option.id)
            .values || [];
        const valuesToDelete = differenceBy(
          initialValuesForOption,
          option.values,
          "id"
        ).map((v) => ({
          optionId: option.id,
          value: v.value,
        }));
        acc.create = [...acc.create, ...valuesToCreate];
        acc.delete = [...acc.delete, ...valuesToDelete];
        return acc;
      },
      {
        create: [],
        delete: [],
      }
    );
    await deleteOptions(
      {
        values: allChanges.delete.map((option) => ({ id: option.value })),
      },
      {
        onError: () => {
          onError("Failed to delete options");
        },
        onSuccess: () => {
          if (allChanges.delete.length) {
            onSuccess("Options deleted successfully");
          }
        },
      }
    );

    await createOptions(
      {
        values: allChanges.create.map((v) => ({
          option_id: v.optionId,
          value: v.value,
        })),
      },
      {
        onError: () => {
          onError("Failed to create options");
        },
        onSuccess: () => {
          if (allChanges.create.length) {
            onSuccess("Options created successfully");
          }
        },
      }
    );
    onClose();
  });

  return (
    <MedusaModal open={open} handleClose={onClose}>
      <MedusaModal.Body>
        <MedusaModal.Header handleClose={onClose}>
          <h1 className="inter-xlarge-semibold">Product Options</h1>
        </MedusaModal.Header>
        <form onSubmit={onSubmit}>
          <MedusaModal.Content>
            <h2 className="inter-large-semibold mb-base">Product options</h2>
            <div className="gap-y-small flex flex-col">
              <div className="gap-y-xsmall flex flex-col">
                {fields.map((field, index) => {
                  return (
                    <div
                      className="gap-x-xsmall grid grid-cols-[150px,1fr]"
                      key={field.id}
                    >
                      {field.title}
                      <Controller
                        control={control}
                        name={`productOptions.${index}.values`}
                        render={({ field: { onChange, value } }) => (
                          <CreatableSelect
                            options={field[field.id]}
                            value={value ? value : []}
                            isMulti
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </MedusaModal.Content>
          <MedusaModal.Footer>
            <div className="gap-xsmall flex w-full items-center justify-end">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-small"
                disabled={!isDirty}
              >
                Save and close
              </button>
            </div>
          </MedusaModal.Footer>
        </form>
      </MedusaModal.Body>
    </MedusaModal>
  );
};

export default OptionValuesModal;
export const config = {};
