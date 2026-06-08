import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, toUserDTO } from "../models/User";
import { HttpError } from "../middleware/error";
import { requireAuth, signToken } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

router.post("/register", validate(RegisterSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof RegisterSchema>;
  const exists = await User.findOne({ email });
  if (exists) throw new HttpError(409, "Email already in use");
  const passwordHash = await bcrypt.hash(password, 10);
  const u = await User.create({ name, email, passwordHash, role: "user" });
  const user = toUserDTO(u);
  const token = signToken({ _id: user._id, role: user.role, email: user.email, name: user.name });
  res.status(201).json({ token, user });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof LoginSchema>;
  const u = await User.findOne({ email });
  if (!u) throw new HttpError(401, "Invalid credentials");
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials");
  const user = toUserDTO(u);
  const token = signToken({ _id: user._id, role: user.role, email: user.email, name: user.name });
  res.json({ token, user });
});

router.get("/me", requireAuth, async (req, res) => {
  const u = await User.findById(req.user!._id);
  if (!u) throw new HttpError(404, "User not found");
  res.json(toUserDTO(u));
});

const UpdateMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(200).optional(),
});

router.put("/me", requireAuth, validate(UpdateMeSchema), async (req, res) => {
  const data = req.body as z.infer<typeof UpdateMeSchema>;
  const u = await User.findById(req.user!._id);
  if (!u) throw new HttpError(404, "User not found");
  if (data.name) u.name = data.name;
  if (data.email) u.email = data.email;
  if (data.password) u.passwordHash = await bcrypt.hash(data.password, 10);
  await u.save();
  res.json(toUserDTO(u));
});

export default router;
