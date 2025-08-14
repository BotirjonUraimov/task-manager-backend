import { IUserPublic } from "./user-public.interface";

export interface IUser extends IUserPublic {
  password?: string;
}
