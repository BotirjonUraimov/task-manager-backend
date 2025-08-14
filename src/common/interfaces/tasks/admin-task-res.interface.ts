import { IUserPublic } from "../users/user-public.interface";
import { ITask } from "./task.interface";

export interface ITaskAdminRes extends ITask {
  createdByUser: IUserPublic | null;
  assignedToUser: IUserPublic | null;
}

export interface ITaskUserRes extends ITask {
  createdByUser: IUserPublic;
}
