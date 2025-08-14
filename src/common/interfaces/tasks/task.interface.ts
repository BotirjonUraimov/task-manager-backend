export interface ITask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo: string | null;
  assignedBy: string | null;
  tags: string[];
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  history: {
    from: "pending" | "in_progress" | "completed" | "cancelled" | null;
    to: "pending" | "in_progress" | "completed" | "cancelled" | null;
    at: Date | null;
    by: string | null;
  }[];
}
