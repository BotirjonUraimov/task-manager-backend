import bcrypt from "bcryptjs";
import jwt, {
  type JwtPayload,
  type Secret,
  type SignOptions,
} from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "../../config/env";
import { UserModel } from "../users/users.model";
import logger from "../../lib/logger";

export async function register(
  name: string,
  email: string,
  password: string,
  role: "admin" | "user" = "user"
) {
  const hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password: hash, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login(email: string, password: string) {
  logger.info("Login request in service");
  try {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid credentials");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Invalid credentials");
    const payload: JwtPayload = { sub: user.id, role: user.role } as any;
    const secret: Secret = jwtSecret as unknown as Secret;
    const options: SignOptions = {
      expiresIn: jwtExpiresIn as unknown as any,
    };
    const accessToken = jwt.sign(payload, secret, options);
    console.log("accessToken:", accessToken);
    logger.info("User logged in successfully in service");
    return { accessToken };
  } catch (error) {
    logger.error({ error }, "Login failed in service");
    throw error;
  }
}

export async function logout() {
  return { message: "Logged out successfully" };
}

export async function me(userId: string) {
  const user = await UserModel.findById(userId);
  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  };
}
