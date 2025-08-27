import { Request, Response } from "express";
import { prisma } from "../connection/client";

//Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return res
        .status(400)
        .json({ error: "ProductId dan quantity harus valid" });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product || product.status !== "active") {
      return res
        .status(404)
        .json({ error: "Produk tidak ditemukan / tidak aktif" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Stock tidak mencukupi" });
    }

    const total = product.price * quantity;

    const pointsEarned = Math.floor(total / 1000);

    const result = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: quantity } },
      });

      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: Number(quantity),
          total,
        },
        include: { product: true },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: pointsEarned } },
      });

      await tx.pointTransaction.create({
        data: {
          senderId: 1,
          receiverId: user.id,
          amount: pointsEarned,
        },
      });

      return { order, updatedUser };
    });

    res.status(201).json({
      message: "Order berhasil dibuat",
      order: result.order,
      pointsEarned,
      userPoints: result.updatedUser.points,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message || "Gagal membuat order" });
  }
};

//Get user order
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Daftar order user",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Gagal mengambil data order" });
  }
};

// get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const take = parseInt(limit as string);
    const currentPage = parseInt(page as string);
    const skip = (currentPage - 1) * take;

    const orders = await prisma.order.findMany({
      skip,
      take,
      orderBy: {
        [sortBy as string]: order === "asc" ? "asc" : "desc",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true, price: true },
        },
      },
    });

    const total = await prisma.order.count();
    const totalPages = Math.ceil(total / take);

    res.status(200).json({
      message: "List semua order berhasil diambil",
      data: orders,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ error: "Gagal mengambil semua order" });
  }
};

// GET order summary
export const getOrderSummary = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 5);
  const page = Number(req.query.page ?? 1);
  const skip = (page - 1) * limit;

  try {
    // Group orders by userId
    const summary = await prisma.order.groupBy({
      by: ["userId"],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { userId: "asc" },
      skip,
      take: limit,
    });

    const userIds = summary.map((s) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = summary.map((s) => ({
      userId: s.userId,
      userName: userMap.get(s.userId)?.name ?? null,
      totalQuantity: s._sum.quantity ?? 0,
      totalOrders: s._count.id ?? 0,
    }));

    const allGroups = await prisma.order.groupBy({ by: ["userId"] });
    const totalUsers = allGroups.length;
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      data: enriched,
      meta: {
        totalUsers,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getOrderSummary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
