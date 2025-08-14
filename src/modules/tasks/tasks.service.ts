import z from "zod";
import { TasksRepository, ITaskAdminRes } from "./tasks.repository";
import { IBasePaginationResDTO } from "../../common/interfaces/base/base-pagination.interface";
import { IListOptions } from "../../common/interfaces/base/list-options.interface";
import { ITask } from "../../common/interfaces/tasks/task.interface";
import logger from "../../lib/logger";
import { AnalyticsFilter } from "../../common/interfaces/tasks/analytics.interface";

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.coerce.date(),
  priority: z.enum(["low", "medium", "high"]),
  assignedBy: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const qSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  tags: z
    .string()
    .transform((s) => s.split(",").map((t) => t.trim()))
    .optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const TasksService = {
  async list(
    requestingUser: {
      id: string;
      role: "admin" | "user";
    },
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITask | ITaskAdminRes>> {
    if (requestingUser.role === "admin")
      return TasksRepository.listAll(options);
    return TasksRepository.listByCreator(requestingUser.id, options);
  },

  async listAssigned(
    requestingUser: {
      id: string;
    },
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITask>> {
    return TasksRepository.listByAssignedTo(requestingUser.id, options);
  },

  async get(
    id: string,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<ITask | undefined> {
    console.log("Service get - id:", id, "user:", requestingUser);
    if (requestingUser.role === "admin") return TasksRepository.get(id);
    return TasksRepository.getByIdAndCreatorOrAssignedTo(id, requestingUser.id);
  },

  async create(
    input: unknown,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<ITask> {
    try {
      logger.info("Creating task in service");
      const parsed = CreateTaskSchema.parse(input);
      console.log("parsed", parsed);
      if (parsed.assignedTo) {
        parsed.assignedBy = requestingUser.id;
      }
      const normalized = {
        ...parsed,
        assignedTo: parsed.assignedTo ?? null,
        assignedBy: parsed.assignedBy ?? null,
        tags: parsed.tags ?? [],
        createdBy: requestingUser.id,
      } as Omit<ITask, "id"> & { createdBy: string } as any;
      return TasksRepository.insert(normalized as any);
    } catch (error: any) {
      logger.error("Error creating task in service", error.message);
      throw error;
    }
  },
  async update(
    id: string,
    update: Partial<Omit<ITask, "id">>,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<ITask | undefined> {
    logger.info("Updating task in service");
    if (requestingUser.role === "admin")
      return TasksRepository.updateById(id, requestingUser.id, update);
    return TasksRepository.updateByIdAndCreatorOrAssignedTo(
      id,
      requestingUser.id,
      update
    );
  },
  async remove(
    id: string,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<boolean> {
    if (requestingUser.role === "admin") return TasksRepository.deleteById(id);
    return TasksRepository.deleteByIdAndCreator(id, requestingUser.id);
  },

  async analytics(dto: AnalyticsFilter) {
    logger.info("Analytics in service");
    console.log("dto", dto);
    const parsed = qSchema.safeParse(dto);
    if (!parsed.success) {
      throw new Error("Invalid query parameters");
    }
    return TasksRepository.analytics(parsed.data);
  },
};
