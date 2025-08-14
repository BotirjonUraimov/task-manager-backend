import { IBasePaginationResDTO } from "../../common/interfaces/base/base-pagination.interface";
import { IListOptions } from "../../common/interfaces/base/list-options.interface";
import { ITask } from "../../common/interfaces/tasks/task.interface";
import { TaskDocument, TaskModel } from "./tasks.model";
import logger from "../../lib/logger";
import mongoose from "mongoose";

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

export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ITaskAdminRes extends ITask {
  createdByUser: IUserPublic | null;
  assignedToUser: IUserPublic | null;
}

export interface ITaskUserRes extends ITask {
  createdByUser: IUserPublic;
}

export const TasksRepository = {
  async listAll(
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITaskAdminRes>> {
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

    const [result] = await TaskModel.aggregate([
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            // Convert string IDs to ObjectId for lookups
            {
              $addFields: {
                createdByObjId: { $toObjectId: "$createdBy" },
                assignedToObjId: {
                  $cond: [
                    { $ifNull: ["$assignedTo", false] },
                    { $toObjectId: "$assignedTo" },
                    null,
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "createdByObjId",
                foreignField: "_id",
                as: "createdByUser",
              },
            },
            {
              $unwind: {
                path: "$createdByUser",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "assignedToObjId",
                foreignField: "_id",
                as: "assignedToUser",
              },
            },
            {
              $unwind: {
                path: "$assignedToUser",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                id: { $toString: "$_id" },
                title: 1,
                description: 1,
                dueDate: 1,
                priority: 1,
                status: 1,
                tags: 1,

                createdAt: 1,
                updatedAt: 1,
                createdByUser: {
                  id: { $toString: "$createdByUser._id" },
                  name: "$createdByUser.name",
                  email: "$createdByUser.email",
                  role: "$createdByUser.role",
                },
                assignedToUser: {
                  $cond: [
                    { $ifNull: ["$assignedToUser", false] },
                    {
                      id: { $toString: "$assignedToUser._id" },
                      name: "$assignedToUser.name",
                      email: "$assignedToUser.email",
                      role: "$assignedToUser.role",
                    },
                    null,
                  ],
                },
              },
            },
          ],
          meta: [{ $count: "total" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        },
      },
    ]).exec();
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
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
    const task = await TaskModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $addFields: {
          createdByObjId: { $toObjectId: "$createdBy" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdByObjId",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          title: 1,
          description: 1,
          dueDate: 1,
          priority: 1,
          status: 1,
          tags: 1,
          createdByUser: {
            $cond: {
              if: { $ne: ["$createdByUser", null] },
              then: {
                id: { $toString: "$createdByUser._id" },
                name: "$createdByUser.name",
                email: "$createdByUser.email",
                role: "$createdByUser.role",
              },
              else: null,
            },
          },
        },
      },
    ]).exec();

    return task[0] || undefined;
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
