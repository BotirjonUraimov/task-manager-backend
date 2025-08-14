import { z } from "zod";
import { UsersRepository, UserDTO } from "./users.repository";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UsersService = {
  async list(): Promise<UserDTO[]> {
    return UsersRepository.list();
  },
  async get(id: string): Promise<UserDTO | undefined> {
    return UsersRepository.get(id);
  },
  async create(input: unknown): Promise<UserDTO> {
    const parsed = CreateUserSchema.parse(input);
    return UsersRepository.insert(parsed);
  },
};
