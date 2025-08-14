import logger from "../../lib/logger";
import { UserModel, UserDocument } from "./users.model";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

function toDTO(doc: UserDocument): UserDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role as "admin" | "user",
  };
}

export const UsersRepository = {
  async list(): Promise<UserDTO[]> {
    logger.info("Listing users in repository");
    const users = await UserModel.find().lean();
    return users.map((d: any) => toDTO(d));
  },
  async get(id: string): Promise<UserDTO | undefined> {
    const user = await UserModel.findById(id);
    return user ? toDTO(user) : undefined;
  },
  async insert(dto: Omit<UserDTO, "id">): Promise<UserDTO> {
    const user = await UserModel.create(dto);
    return toDTO(user);
  },
};
