import express = require("express");
import router from "./routes/product-routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", router);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("server is running");
});
