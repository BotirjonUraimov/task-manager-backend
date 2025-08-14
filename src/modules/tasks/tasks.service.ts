import z from "zod";
import { TaskDTO, TasksRepository } from "./tasks.repository";

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.date(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const TasksService = {
  async list(): Promise<TaskDTO[]> {
    return TasksRepository.list();
  },
  async get(id: string): Promise<TaskDTO | undefined> {
    return TasksRepository.get(id);
  },
  async create(input: unknown): Promise<TaskDTO> {
    const parsed = CreateTaskSchema.parse(input);
    const normalized = {
      ...parsed,
      assignedTo: parsed.assignedTo ?? null,
      tags: parsed.tags ?? [],
    };
    return TasksRepository.insert(normalized);
  },
};
