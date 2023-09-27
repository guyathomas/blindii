import { Column, useTable } from "react-table";
import { ProductOption, ProductVariant } from "@medusajs/medusa";
import { useMemo } from "react";

type Props = {
  productOptions: ProductOption[];
  productId: string;
};

const ProductOptionTable = ({ productOptions, productId }: Props) => {
  const columns = useMemo<Column<ProductVariant>[]>(
    () => [
      {
        Header: "Option",
        id: "option",
        accessor: "title",
      },
      {
        Header: "Values",
        id: "values",
        accessor: "values",
        Cell: ({ value }) => value.map((value) => value.value).join(", "),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: productOptions,
      defaultColumn: {
        width: "auto",
      },
    });

  return (
    <table {...getTableProps()} className="w-full table-fixed" role="table">
      <thead className="inter-small-semibold text-grey-50 border-grey-20 whitespace-nowrap border-t border-b">
        {headerGroups?.map((headerGroup) => {
          const { key, ...rest } = headerGroup.getHeaderGroupProps();
          return (
            <tr key={key} {...rest}>
              {headerGroup.headers.map((col) => {
                const { key, ...rest } = col.getHeaderProps();

                return (
                  <th key={key} {...rest} className="h-[40px] text-left">
                    {col.render("Header")}
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const { key, ...rest } = row.getRowProps();
          return (
            <tr
              color="inherit"
              key={key}
              {...rest}
              role="row"
              className="inter-small-regular border-grey-20 text-grey-90 border-t border-b"
            >
              {row.cells.map((cell) => {
                const { key, ...rest } = cell.getCellProps();
                return (
                  <td
                    key={key}
                    {...rest}
                    className="inter-small-regular h-[40px]"
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProductOptionTable;

export const config = {};
