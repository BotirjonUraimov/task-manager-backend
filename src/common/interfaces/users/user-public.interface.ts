export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}
