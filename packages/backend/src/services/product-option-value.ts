import {
  TransactionBaseService,
  ProductOptionValue,
  EventBusService,
  buildQuery,
  FindConfig,
} from "@medusajs/medusa";
import ProductOptionValueRepository from "@medusajs/medusa/dist/repositories/product-option-value";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";

export default class ProductOptionValueService extends TransactionBaseService {
  static Events = {
    CREATED: "product-option-value.created",
    UPDATED: "product-option-value.updated",
    DELETED: "product-option-value.deleted",
  };
  protected readonly productOptionValueRepository_: typeof ProductOptionValueRepository;
  protected readonly productRepository_: typeof ProductRepository;
  protected readonly eventBusService_: EventBusService;
  constructor({
    productOptionValueRepository,
    productRepository,
    eventBusService,
  }) {
    super(arguments[0]);
    this.productOptionValueRepository_ = productOptionValueRepository;
    this.productRepository_ = productRepository;
    this.eventBusService_ = eventBusService;
  }

  /**
   * Adds ProductOptionValues. Example input: [{ value: "Left", product_id: "abc" }, { value: "Right", product_id: "def" }]
   * for a given product option
   * @param productId - the ID of the product that the option values are associated with
   * @param data - the data to create the options with
   * @return the result of the model update operation
   */
  async addProductOptionValues(
    data: Partial<ProductOptionValue>[]
  ): Promise<ProductOptionValue[]> {
    return await this.atomicPhase_(async (manager) => {
      const productOptionValueRepo = manager.withRepository(
        this.productOptionValueRepository_
      );
      const optionEntries = productOptionValueRepo.create(data);
      await productOptionValueRepo.insert(optionEntries);

      this.eventBusService_.emit(ProductOptionValueService.Events.CREATED, {
        optionValues: optionEntries,
      });

      return optionEntries;
    });
  }

  /**
   * Deletes a list of ProductOptionValues by id, e.g. ['1', '2', '3']
   * @param ids - the array of strings of ID's for options to delete
   * @return the result of the model update operation
   */
  async deleteOptionValues(ids: string[]): Promise<string[]> {
    return await this.atomicPhase_(async (manager) => {
      const productOptionValueRepo = manager.withRepository(
        this.productOptionValueRepository_
      );
      const query = buildQuery(
        { id: ids },
        {} as FindConfig<ProductOptionValue>
      );
      const optionRecords = await productOptionValueRepo.find(query);

      await productOptionValueRepo.softRemove(optionRecords);

      this.eventBusService_.emit(ProductOptionValueService.Events.DELETED, {
        ids,
      });

      return ids;
    });
  }
}
