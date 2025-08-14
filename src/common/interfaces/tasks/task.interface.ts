export interface ITask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  assignedTo: string | null;
  tags: string[];
}
