import { Router } from "express";
import onboardingRoutes from "./onboarding";
import createProductOptionValue from "./create-product-option-value";
import deleteProductOptionValue from "./delete-product-option-value";

export function attachAdminRoutes(adminRouter: Router) {
  // Attach routes for onboarding experience, defined separately
  onboardingRoutes(adminRouter);

  adminRouter.post("/option-value/:product_id", createProductOptionValue);
  adminRouter.delete("/option-value/:id", deleteProductOptionValue);
}
