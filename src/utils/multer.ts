import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads";

    if (req.originalUrl.includes("register")) folder = "uploads/profile";
    if (req.originalUrl.includes("product")) folder = "uploads/products";

    const dest = path.resolve(__dirname, `../${folder}`);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// validasi tipe file
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (jpeg, jpg, png, gif, webp) yang diperbolehkan"
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});
