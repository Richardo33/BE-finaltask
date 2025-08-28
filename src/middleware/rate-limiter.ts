import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "terlalu banya request, mohon tunggu beberapa saat",
});

export default limiter;
