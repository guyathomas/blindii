import { EntityManager } from "typeorm";
import ProductOptionValueService from "src/services/product-option-value";

export default async (req, res) => {
  const { id } = req.params;

  const productOptionValueService: ProductOptionValueService =
    req.scope.resolve("productOptionValueService");
  const manager: EntityManager = req.scope.resolve("manager");

  await manager.transaction(async (transactionManager) => {
    return await productOptionValueService
      .withTransaction(transactionManager)
      .deleteOptionValues([id]);
  });

  res.status(200).send();
};
