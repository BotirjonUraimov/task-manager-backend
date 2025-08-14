import logger from "../../lib/logger";
import { UserModel, UserDocument } from "./users.model";
import bcrypt from "bcryptjs";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  password?: string;
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
    try {
      logger.info("Listing users in repository");
      const users = await UserModel.find().lean();
      return users.map((d: any) => toDTO(d));
    } catch (error: any) {
      logger.error("Error listing users in repository", error.message);
      throw error;
    }
  },

  async getById(id: string): Promise<UserDTO | undefined> {
    try {
      logger.info("Getting user by id in repository");
      const user = await UserModel.findById(id);
      return user ? toDTO(user) : undefined;
    } catch (error: any) {
      logger.error("Error getting user by id in repository", error.message);
      throw error;
    }
  },
  async insert(dto: Omit<UserDTO, "id">): Promise<UserDTO> {
    try {
      logger.info("Inserting new user in repository");
      if (dto.password) {
        const hash = await bcrypt.hash(dto.password, 10);
        dto.password = hash;
        logger.info("New password hashed in repository and inserted");
      }
      const user = await UserModel.create(dto);
      return toDTO(user);
    } catch (error: any) {
      logger.error("Error inserting user in repository", error.message);
      throw error;
    }
  },

  async update(
    id: string,
    dto: Omit<UserDTO, "id">
  ): Promise<UserDTO | undefined> {
    try {
      logger.info("Updating user in repository");
      if (dto.password) {
        const hash = await bcrypt.hash(dto.password, 10);
        dto.password = hash;
        logger.info("New password hashed in repository and updated");
      }
      const user = await UserModel.findByIdAndUpdate(id, dto, { new: true });
      return user ? toDTO(user) : undefined;
    } catch (error: any) {
      logger.error("Error updating user in repository", error.message);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      logger.info("Deleting user in repository");
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        logger.error("User not found in repository");
        throw new Error("User not found");
      }
      logger.info("User deleted in repository");
      return true;
    } catch (error: any) {
      logger.error("Error deleting user in repository", error.message);
      if (error.message.includes("Cast to ObjectId failed for value")) {
        throw new Error("User id is not valid");
      }
      throw error;
    }
  },
};
