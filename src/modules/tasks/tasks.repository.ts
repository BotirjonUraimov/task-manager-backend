import { TaskDocument, TaskModel } from "./tasks.model";

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  assignedTo: string | null;
  tags: string[];
}

function toDTO(doc: TaskDocument): TaskDTO {
  return {
    id: doc.id.toString(),
    title: doc.title,
    description: doc.description,
    dueDate: doc.dueDate,
    priority: doc.priority,
    status: doc.status,
    assignedTo: doc.assignedTo,
    tags: doc.tags,
  };
}

export const TasksRepository = {
  async list(): Promise<TaskDTO[]> {
    const tasks = await TaskModel.find().lean();
    return tasks.map((d: any) => toDTO(d));
  },

  async get(id: string): Promise<TaskDTO | undefined> {
    const task = await TaskModel.findById(id);
    return task ? toDTO(task) : undefined;
  },

  async insert(dto: Omit<TaskDTO, "id">): Promise<TaskDTO> {
    const task = await TaskModel.create(dto);
    return toDTO(task);
  },
};
