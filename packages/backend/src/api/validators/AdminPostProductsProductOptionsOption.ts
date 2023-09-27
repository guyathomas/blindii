import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { registerOverriddenValidators } from "@medusajs/medusa";
import { AdminPostProductsProductOptionsOption as MedusaAdminPostProductsProductOptionsOption } from "@medusajs/medusa/dist/api/routes/admin/products/update-option";

class ProductVariantOptionReq {
  @IsString()
  value: string;

  @IsString()
  option_id: string;

  @IsOptional()
  @IsString()
  variant_id?: string;
}

export default class AdminPostProductsProductOptionsOption extends MedusaAdminPostProductsProductOptionsOption {
  @IsOptional()
  @Type(() => ProductVariantOptionReq)
  @ValidateNested({ each: true })
  @IsArray()
  values?: ProductVariantOptionReq[] = [];
}

registerOverriddenValidators(AdminPostProductsProductOptionsOption);
