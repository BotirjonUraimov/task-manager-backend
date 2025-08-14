import { z } from "zod";
import { UsersRepository } from "./users.repository";
import logger from "../../lib/logger";
import { IUser } from "../../common/interfaces/users/user.interface";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UsersService = {
  async list(): Promise<IUser[]> {
    logger.info("Listing users in service");
    return UsersRepository.list();
  },
  async getById(id: string): Promise<IUser | undefined> {
    logger.info("Getting user by id in service");
    return UsersRepository.getById(id);
  },
  async create(input: unknown): Promise<IUser> {
    logger.info("Creating user in service");
    const parsed = CreateUserSchema.parse(input);
    logger.info("User parsed in service");
    return UsersRepository.insert(parsed);
  },
  async update(id: string, input: unknown): Promise<IUser | undefined> {
    logger.info("Updating user in service");
    const parsed = CreateUserSchema.parse(input);
    return UsersRepository.update(id, parsed);
  },
  async delete(id: string): Promise<boolean> {
    logger.info("Deleting user in service");
    return UsersRepository.delete(id);
  },
};
