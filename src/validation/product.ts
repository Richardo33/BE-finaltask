import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Nama produk wajib diisi",
    "string.min": "Nama produk minimal 3 karakter",
    "any.required": "Nama produk wajib diisi",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Harga harus berupa angka",
    "number.min": "Harga tidak boleh negatif",
    "any.required": "Harga wajib diisi",
  }),
  stock: Joi.number().min(0).required().messages({
    "number.base": "Stok harus berupa angka",
    "number.min": "Stok tidak boleh negatif",
    "any.required": "stok wajib diisi",
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).messages({
    "string.min": "Nama produk minimal 3 karakter",
  }),
  price: Joi.number().min(0).messages({
    "number.base": "Harga harus berupa angka",
    "number.min": "Harga tidak boleh negatif",
  }),
  stock: Joi.number().min(1).messages({
    "number.base": "Stok harus berupa angka",
    "number.min": "Stok minimal harus 1",
  }),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "ID harus berupa angka",
    "number.integer": "ID harus berupa bilangan bulat",
    "number.min": "ID minimal 1",
    "any.required": "ID wajib diisi",
  }),
});
