import express = require("express");

import { register, login } from "../controllers/authControllers";

import {
  createProduct,
  getProducts,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  //   getActiveProducts,
} from "../controllers/productController";

import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderSummary,
} from "../controllers/orderController";

import {
  transferPoints,
  getAllPointTransactions,
} from "../controllers/transaction";

import { upload } from "../utils/multer";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/auth";
import { authorize } from "../middleware/authorize";
import limiter from "../middleware/rate-limiter";

const router = express.Router();

router.post(
  "/register",
  upload.single("profileImage"),
  validate(registerSchema),
  register
);
router.post("/login", validate(loginSchema), login);

router.post(
  "/product",
  authenticate,
  authorize("admin"),
  upload.single("productImage"),
  createProduct
);
router.get("/products", limiter, authenticate, getProducts);
router.patch(
  "/product/:id",
  authenticate,
  authorize("admin"),
  upload.single("productImage"),
  updateProduct
);
router.patch(
  "/product/:id/delete",
  authenticate,
  authorize("admin"),
  softDeleteProduct
);
router.patch(
  "/product/:id/restore",
  authenticate,
  authorize("admin"),
  restoreProduct
);

router.get("/orders/me", authenticate, getUserOrders);
router.post("/orders", authenticate, createOrder);
router.get("/orders", authenticate, authorize("admin"), getAllOrders);
router.get(
  "/orders/summary",
  authenticate,
  authorize("admin"),
  getOrderSummary
);

router.post("/transfer-points", authenticate, transferPoints);
router.get(
  "/transactions",
  authenticate,
  authorize("admin"),
  getAllPointTransactions
);

export default router;
