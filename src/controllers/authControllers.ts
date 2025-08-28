import { Request, Response, NextFunction } from "express";
import { prisma } from "../connection/client";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";

//register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email atau password harus diisi" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 bung" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah ada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileImageUrl = req.file
      ? `/uploads/profile/${req.file.filename}`
      : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
      },
    });

    res.status(201).json({
      message: "Berhasil",
      user: { id: user.id, email: user.email, profileImageUrl },
    });
  } catch (error) {
    next(error);
  }
};

//login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.json({ message: "Login berhasil", token });
  } catch (error) {
    next(error);
  }
};

//Get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      message: "Daftar semua user",
      users,
    });
  } catch (error) {
    next(error);
  }
};
