import express = require("express");

import { register, login } from "../controllers/authControllers";

import {
  createProduct,
  getProducts,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  //   getActiveProducts,
  hardDeleteProduct,
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
import { validate, validateParams } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/auth";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
} from "../validation/product";
import {
  createOrderSchema,
  getOrdersQuerySchema,
  getOrderSummaryQuerySchema,
} from "../validation/order";
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
  validate(createProductSchema),
  createProduct
);
router.get("/products", limiter, authenticate, getProducts);
router.patch(
  "/product/:id",
  authenticate,
  authorize("admin"),
  upload.single("productImage"),
  validate(updateProductSchema),
  updateProduct
);
router.patch(
  "/product/:id/delete",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  softDeleteProduct
);
router.patch(
  "/product/:id/restore",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  restoreProduct
);
router.delete(
  "/product/delete/:id",
  authenticate,
  authorize("admin"),
  hardDeleteProduct
);

router.get("/orders/me", authenticate, getUserOrders);
router.post("/orders", authenticate, validate(createOrderSchema), createOrder);
router.get(
  "/orders",
  authenticate,
  authorize("admin"),
  validate(getOrdersQuerySchema, "query"),
  getAllOrders
);
router.get(
  "/orders/summary",
  authenticate,
  authorize("admin"),
  validate(getOrderSummaryQuerySchema, "query"),
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
