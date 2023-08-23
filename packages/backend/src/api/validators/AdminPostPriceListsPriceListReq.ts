import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { registerOverriddenValidators } from "@medusajs/medusa";
import { AdminPostPriceListsPriceListReq as MedusaAdminPostPriceListsPriceListReq } from "@medusajs/medusa";
import { AdminPriceListPricesCreateReq as MedusaAdminPriceListPricesCreateReq } from "@medusajs/medusa/dist/types/price-list";

class AdminPriceListPricesCreateReq extends MedusaAdminPriceListPricesCreateReq {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  price_list_id?: string;
}
console.log("zzz will try override");

class AdminPostPriceListsPriceListReq extends MedusaAdminPostPriceListsPriceListReq {
  @IsArray()
  @Type(() => AdminPriceListPricesCreateReq)
  @ValidateNested({ each: true })
  prices: AdminPriceListPricesCreateReq[];
}

registerOverriddenValidators(AdminPostPriceListsPriceListReq);
