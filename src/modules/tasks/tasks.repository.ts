import { IBasePaginationResDTO } from "../../common/interfaces/base/base-pagination.interface";
import { IListOptions } from "../../common/interfaces/base/list-options.interface";
import { ITask } from "../../common/interfaces/tasks/task.interface";
import { TaskDocument, TaskModel } from "./tasks.model";
import logger from "../../lib/logger";

function toDTO(doc: TaskDocument): ITask {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    dueDate: doc.dueDate,
    priority: doc.priority,
    status: doc.status,
    assignedTo: doc.assignedTo,
    tags: doc.tags,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const TasksRepository = {
  async listAll(
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITask>> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    const count = await TaskModel.countDocuments();
    const tasks = await TaskModel.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const dtoTasks = tasks.map((d: any) => toDTO(d));
    return {
      data: dtoTasks,
      total: count,
      page,
      limit,
    };
  },

  async listByCreator(
    userId: string,
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITask>> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    const count = await TaskModel.countDocuments({ createdBy: userId });
    const tasks = await TaskModel.find({ createdBy: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const dtoTasks = tasks.map((d: any) => toDTO(d));
    return {
      data: dtoTasks,
      total: count,
      page,
      limit,
    };
  },

  async get(id: string): Promise<ITask | undefined> {
    const task = await TaskModel.findById(id);
    return task ? toDTO(task) : undefined;
  },

  async getByIdAndCreator(
    id: string,
    userId: string
  ): Promise<ITask | undefined> {
    const task = await TaskModel.findOne({ _id: id, createdBy: userId });
    return task ? toDTO(task) : undefined;
  },

  async insert(dto: Omit<ITask, "id">): Promise<ITask> {
    logger.info("Inserting task in repository");
    const task = await TaskModel.create(dto);
    return toDTO(task);
  },

  async updateById(
    id: string,
    update: Partial<Omit<ITask, "id">>
  ): Promise<ITask | undefined> {
    const task = await TaskModel.findByIdAndUpdate(id, update, { new: true });
    return task ? toDTO(task) : undefined;
  },

  async updateByIdAndCreator(
    id: string,
    userId: string,
    update: Partial<Omit<ITask, "id">>
  ): Promise<ITask | undefined> {
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      update,
      { new: true }
    );
    return task ? toDTO(task) : undefined;
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await TaskModel.findByIdAndDelete(id);
    return Boolean(res);
  },

  async deleteByIdAndCreator(id: string, userId: string): Promise<boolean> {
    const res = await TaskModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });
    return Boolean(res);
  },
};
