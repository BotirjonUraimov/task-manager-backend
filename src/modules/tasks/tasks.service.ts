import z from "zod";
import { TasksRepository } from "./tasks.repository";
import { IBasePaginationResDTO } from "../../common/interfaces/base/base-pagination.interface";
import { IListOptions } from "../../common/interfaces/base/list-options.interface";
import { ITask } from "../../common/interfaces/tasks/task.interface";
import logger from "../../lib/logger";

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.coerce.date(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const TasksService = {
  async list(
    requestingUser: {
      id: string;
      role: "admin" | "user";
    },
    options: IListOptions = {}
  ): Promise<IBasePaginationResDTO<ITask>> {
    if (requestingUser.role === "admin")
      return TasksRepository.listAll(options);
    return TasksRepository.listByCreator(requestingUser.id, options);
  },
  async get(
    id: string,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<ITask | undefined> {
    if (requestingUser.role === "admin") return TasksRepository.get(id);
    return TasksRepository.getByIdAndCreator(id, requestingUser.id);
  },
  async create(
    input: unknown,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<ITask> {
    try {
      logger.info("Creating task in service");
      const parsed = CreateTaskSchema.parse(input);
      const normalized = {
        ...parsed,
        assignedTo: parsed.assignedTo ?? null,
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
    if (requestingUser.role === "admin")
      return TasksRepository.updateById(id, update);
    return TasksRepository.updateByIdAndCreator(id, requestingUser.id, update);
  },
  async remove(
    id: string,
    requestingUser: { id: string; role: "admin" | "user" }
  ): Promise<boolean> {
    if (requestingUser.role === "admin") return TasksRepository.deleteById(id);
    return TasksRepository.deleteByIdAndCreator(id, requestingUser.id);
  },
};
