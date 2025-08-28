import { Request, Response } from "express";

import { prisma } from "../connection/client";

//Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body;

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Produk dengan nama ini sudah ada" });
    }

    const productImageUrl = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        productImageUrl,
      },
    });

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Gagal menambahkan produk" });
  }
};

//Get product
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      minPrice,
      maxPrice,
      status,
      sortBy = "id",
      order = "asc",
      page = "1",
      limit = "5",
    } = req.query;

    const validSortFields = ["id", "name", "price", "createdAt"];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "id";

    const sortOrder = order === "desc" ? "desc" : "asc";

    const filters: any = {};

    if (minPrice) filters.price = { gte: parseFloat(minPrice as string) };
    if (maxPrice)
      filters.price = {
        ...(filters.price || {}),
        lte: parseFloat(maxPrice as string),
      };

    if (status === "active") {
      filters.deletedAt = null;
    } else if (status === "inactive") {
      filters.deletedAt = { not: null };
    }

    const take = parseInt(limit as string);
    const currentPage = parseInt(page as string);
    const skip = (currentPage - 1) * take;

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: { [sortField]: sortOrder },
      take,
      skip,
    });

    const total = await prisma.product.count({ where: filters });
    const totalPages = Math.ceil(total / take);

    res.status(200).json({
      data: products,
      total,
      page: currentPage,
      limit: take,
      totalPages,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
};

//Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const productImageUrl = req.file
      ? `/uploads/products/${req.file.filename}`
      : undefined;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(productImageUrl && { productImageUrl }),
      },
    });

    res.status(200).json({
      message: "Produk berhasil diupdate",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Gagal update produk" });
  }
};

//softdelete product
export const softDeleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }

    if (product.deletedAt) {
      return res
        .status(400)
        .json({ success: false, message: "Produk sudah dihapus" });
    }

    const deletedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date(), status: "inactive" },
    });

    res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus (soft delete)",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus produk" });
  }
};

//restore product
export const restoreProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }

    if (!product.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Produk tidak dalam kondisi terhapus",
      });
    }

    const restoredProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: null, status: "active" },
    });

    res.status(200).json({
      success: true,
      message: "Produk berhasil direstore",
      data: restoredProduct,
    });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ success: false, message: "Gagal merestore produk" });
  }
};

// Hard delete product
export const hardDeleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Produk berhasil dihapus permanen" });
  } catch (error: any) {
    console.error("Hard delete error:", error);
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
};
