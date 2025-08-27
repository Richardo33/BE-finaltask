// controllers/pointController.ts
import { Request, Response } from "express";
import { prisma } from "../connection/client";

//send point
export const transferPoints = async (req: Request, res: Response) => {
  const senderId = (req as any).user.id;
  const { receiverId, amount } = req.body;

  if (!receiverId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "ReceiverId dan amount wajib diisi, amount > 0",
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId } });
      if (!sender) throw new Error("Pengirim tidak ditemukan");

      if (sender.points < amount) {
        throw new Error("Saldo poin tidak cukup");
      }

      const receiver = await tx.user.findUnique({ where: { id: receiverId } });
      if (!receiver) throw new Error("Penerima tidak ditemukan");

      const updatedSender = await tx.user.update({
        where: { id: senderId },
        data: { points: sender.points - amount },
      });

      const updatedReceiver = await tx.user.update({
        where: { id: receiverId },
        data: { points: receiver.points + amount },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          senderId,
          receiverId,
          amount,
        },
      });

      return { updatedSender, updatedReceiver, transaction };
    });

    return res.status(200).json({
      success: true,
      message: "Transfer poin berhasil",
      data: result,
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat transfer poin",
    });
  }
};

//get all trasactions
export const getAllPointTransactions = async (req: Request, res: Response) => {
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

    const transactions = await prisma.pointTransaction.findMany({
      skip,
      take,
      orderBy: {
        [sortBy as string]: order === "asc" ? "asc" : "desc",
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });

    const total = await prisma.pointTransaction.count();
    const totalPages = Math.ceil(total / take);

    res.status(200).json({
      success: true,
      message: "List semua transaksi poin berhasil diambil",
      data: transactions,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi poin",
    });
  }
};
