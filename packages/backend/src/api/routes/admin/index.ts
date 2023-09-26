import { Router } from "express";
import onboardingRoutes from "./onboarding";

export function attachAdminRoutes(adminRouter: Router) {
  // Attach routes for onboarding experience, defined separately
  onboardingRoutes(adminRouter);
}
