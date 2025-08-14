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

export const UsersRepository = {
  async list(): Promise<UserDTO[]> {
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
