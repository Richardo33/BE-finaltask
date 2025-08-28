import Joi from "joi";

export const createOrderSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    "number.base": "ProductId harus berupa angka",
    "number.positive": "ProductId harus lebih besar dari 0",
    "any.required": "ProductId wajib diisi",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity harus berupa angka",
    "number.min": "Quantity minimal 1",
    "any.required": "Quantity wajib diisi",
  }),
});

export const getOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("id", "createdAt", "total").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

export const getOrderSummaryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(5),
});
