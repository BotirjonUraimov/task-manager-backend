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
    assignedTo: doc.assignedTo?.toString() || null,
    assignedBy: doc.assignedBy?.toString() || null,
    tags: doc.tags,
    createdBy: doc.createdBy?.toString(),
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    cancelledAt: doc.cancelledAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    history:
      doc.history?.map((entry) => ({
        from: entry.from,
        to: entry.to,
        at: entry.at,
        by: entry.by?.toString() || null,
      })) || [],
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
                history: 1,
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

  async listByAssignedTo(
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
    const count = await TaskModel.countDocuments({ assignedTo: userId });
    const tasks = await TaskModel.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(userId) } },
      {
        $addFields: {
          assignedByObjId: { $toObjectId: "$assignedBy" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedByObjId",
          foreignField: "_id",
          as: "assignedByAdmin",
        },
      },
      {
        $unwind: {
          path: "$assignedByAdmin",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
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
          startedAt: 1,
          completedAt: 1,
          cancelledAt: 1,
          assignedTo: 1,
          assignedByAdmin: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$assignedBy", null] },
                  { $ne: ["$assignedByAdmin", null] },
                ],
              },
              then: {
                id: { $toString: "$assignedByAdmin._id" },
                name: "$assignedByAdmin.name",
                email: "$assignedByAdmin.email",
                role: "$assignedByAdmin.role",
              },
              else: null,
            },
          },
          createdAt: 1,
          updatedAt: 1,
          history: {
            from: 1,
            to: 1,
            at: 1,
            by: 1,
          },
        },
      },
    ]).exec();
    return {
      data: tasks,
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
    console.log("userId", userId);
    console.log("typeof userId", typeof userId);
    const count = await TaskModel.countDocuments({ createdBy: userId });
    const tasks = await TaskModel.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
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
          startedAt: 1,
          completedAt: 1,
          cancelledAt: 1,
          createdAt: 1,
          updatedAt: 1,
          history: 1,
        },
      },
    ]).exec();

    console.log("tasks", tasks);
    console.log("count", count);
    return {
      data: tasks,
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
          startedAt: 1,
          completedAt: 1,
          cancelledAt: 1,
          history: 1,
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

  async getByIdAndCreatorOrAssignedTo(
    id: string,
    userId: string
  ): Promise<ITask | undefined> {
    console.log("id", id);
    console.log("userId", userId);

    const task = await TaskModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          $or: [
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { assignedTo: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $addFields: {
          createdByObjId: { $toObjectId: "$createdBy" },
          assignedByObjId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$assignedBy", null] },
                  { $ne: ["$assignedBy", ""] },
                ],
              },
              then: { $toObjectId: "$assignedBy" },
              else: null,
            },
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
          localField: "assignedByObjId",
          foreignField: "_id",
          as: "assignedByAdmin",
        },
      },
      {
        $unwind: {
          path: "$assignedByAdmin",
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
          startedAt: 1,
          completedAt: 1,
          cancelledAt: 1,
          createdBy: {
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
          assignedBy: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$assignedByObjId", null] },
                  { $ne: ["$assignedByAdmin", null] },
                ],
              },
              then: {
                id: { $toString: "$assignedByAdmin._id" },
                name: "$assignedByAdmin.name",
                email: "$assignedByAdmin.email",
                role: "$assignedByAdmin.role",
              },
              else: null,
            },
          },
          history: 1,
        },
      },
    ]).exec();

    return task[0] || undefined;
  },

  async insert(dto: Omit<ITask, "id">): Promise<ITask> {
    logger.info("Inserting task in repository");
    const task = await TaskModel.create(dto);
    return toDTO(task);
  },

  async updateById(
    id: string,
    userId: string,
    update: Partial<Omit<ITask, "id">>
  ): Promise<ITask | undefined> {
    try {
      console.log("update", update);

      const existingTask = await TaskModel.findById(id);
      if (!existingTask) {
        throw new Error("Task not found");
      }
      if (update.assignedTo) {
        update.assignedBy = userId;
      }

      if (update.status) {
        if (update.status === "in_progress") {
          update.startedAt = new Date();
        }
        if (update.status === "completed") {
          update.completedAt = new Date();
        }
        if (update.status === "cancelled") {
          update.cancelledAt = new Date();
        }
        const history = {
          from: existingTask?.status,
          to: update.status,
          at: new Date(),
          by: userId,
        };
        update.history = [...(update.history || []), history];
      }
      const task = await TaskModel.findByIdAndUpdate(id, update, { new: true });
      return task ? toDTO(task) : undefined;
    } catch (error: any) {
      logger.error("Error updating task in repository", error.message);
      throw error;
    }
  },

  async updateByIdAndCreatorOrAssignedTo(
    id: string,
    userId: string,
    update: Partial<Omit<ITask, "id">>
  ): Promise<ITask | undefined> {
    try {
      let isAssigned = false;

      let existingTask = await TaskModel.findOne({
        _id: id,
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      });
      if (!existingTask) {
        throw new Error("Task not found");
      }

      if (update.assignedTo) {
        throw new Error("You are not allowed to assign this task");
      }

      if (update.status) {
        if (update.status === "in_progress") {
          update.startedAt = new Date();
        }
        if (update.status === "completed") {
          update.completedAt = new Date();
        }
        if (update.status === "cancelled") {
          update.cancelledAt = new Date();
        }
        const history = {
          from: existingTask?.status,
          to: update.status,
          at: new Date(),
          by: userId,
        };
        update.history = [...(update.history || []), history];
      }

      logger.info("Updating task in repository");
      let task = await TaskModel.findOneAndUpdate(
        { _id: id, createdBy: userId },
        update,
        { new: true }
      );

      if (!task) {
        task = await TaskModel.findOneAndUpdate(
          { _id: id, assignedTo: userId },
          update,
          { new: true }
        );
        isAssigned = true;
      }
      if (isAssigned) {
        logger.info("Assigned task is updated");
      } else {
        logger.info("User's task is updated");
      }
      return task ? toDTO(task) : undefined;
    } catch (error: any) {
      logger.error("Error updating task in repository", error.message);
      throw error;
    }
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
