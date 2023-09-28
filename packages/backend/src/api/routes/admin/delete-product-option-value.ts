import { IsString, IsArray, ValidateNested } from "class-validator";
import { EntityManager } from "typeorm";
import { Type } from "class-transformer";
import { validator, Product, ProductService } from "@medusajs/medusa";
import ProductOptionValueService from "src/services/product-option-value";

export default async (req, res) => {
  const { product_id } = req.params;

  const validated = await validator(
    AdminDeleteProductsProductOptionsOptionValuesReq,
    req.body
  );

  const productOptionValueService: ProductOptionValueService =
    req.scope.resolve("productOptionValueService");
  const productService: ProductService = req.scope.resolve("productService");
  const manager: EntityManager = req.scope.resolve("manager");

  await manager.transaction(async (transactionManager) => {
    return await productOptionValueService
      .withTransaction(transactionManager)
      .deleteOptionValues(validated.values);
  });

  const select: (keyof Product)[] = ["id", "options"];

  const product = await productService.retrieve(product_id, {
    select,
    relations: ["options"],
  });

  res.json({ product });
};

export class AdminDeleteProductsProductOptionsOptionValuesReq {
  @Type(() => AdminDeleteProductsProductOptionsOptionValue)
  @ValidateNested({ each: true })
  @IsArray()
  values: AdminDeleteProductsProductOptionsOptionValue[] = [];
}

export class AdminDeleteProductsProductOptionsOptionValue {
  @IsString()
  id: string;
}
