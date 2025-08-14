import { useInMemory } from "../../config/env";
import { UserModel, UserDocument } from "./users.model";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

function toDTO(doc: UserDocument): UserDTO {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
  };
}

// Simple in-memory fallback
const memoryStore: UserDTO[] = [];

export const UsersRepository = {
  async list(): Promise<UserDTO[]> {
    if (useInMemory) return memoryStore;
    const docs = await UserModel.find().lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
    }));
  },
  async get(id: string): Promise<UserDTO | undefined> {
    if (useInMemory) return memoryStore.find((u) => u.id === id);
    const doc = await UserModel.findById(id);
    return doc ? toDTO(doc) : undefined;
  },
  async insert(user: Omit<UserDTO, "id">): Promise<UserDTO> {
    if (useInMemory) {
      const created: UserDTO = {
        id: Math.random().toString(36).slice(2),
        ...user,
      };
      memoryStore.push(created);
      return created;
    }
    const doc = await UserModel.create(user);
    return toDTO(doc);
  },
};
