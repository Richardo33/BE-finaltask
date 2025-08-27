import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Nama wajib diisi",
    "string.min": "Nama minimal 3 karakter",
    "any.required": "Nama wajib diisi",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter",
    "any.required": "Password wajib diisi",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password wajib diisi",
  }),
});
