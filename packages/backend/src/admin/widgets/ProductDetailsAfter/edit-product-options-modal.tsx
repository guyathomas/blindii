import { ProductOption } from "@medusajs/medusa";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import differenceBy from "lodash/differenceBy";
import MedusaModal from "./medusa-modal";
import CreatableSelect from "react-select/creatable";

type Props = {
  productOptions: ProductOption[];
  open: boolean;
  onClose: () => void;
  variantId: string;
};
type OptionInput = { value: string; label: string; id?: string };
type OptionField = { id: string; title: string; values: OptionInput[] };
type OptionValuesForm = {
  productOptions: OptionField[];
};
type CreateOptionInput = { optionId: string; value: string };

const OptionValuesModal = ({
  variantId,
  open,
  onClose,
  productOptions,
}: Props) => {
  const defaultValues = {
    productOptions: productOptions.map((option) => ({
      id: option.id,
      title: option.title,
      values: option.values.map(({ value, id }) => ({
        label: value,
        value: id,
        id,
      })),
    })),
  };
  const {
    control,
    register,
    formState: { isDirty },
    handleSubmit,
  } = useForm<OptionValuesForm>({
    defaultValues,
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
          .filter((v) => !v.id)
          .map((v) => ({
            optionId: option.id,
            value: v.value,
          }));
        const initialValuesForOption: OptionInput[] =
          defaultValues.productOptions.find((o) => o.id === option.id).values ||
          [];
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
    console.log("zzz allChanges", allChanges);
  });

  return (
    <MedusaModal open={open} handleClose={onClose}>
      <MedusaModal.Body>
        <MedusaModal.Header handleClose={onClose}>
          <h1 className="inter-xlarge-semibold">Variant Options</h1>
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
