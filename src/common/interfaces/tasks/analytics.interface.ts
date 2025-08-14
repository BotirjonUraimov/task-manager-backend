export type AnalyticsFilter = {
  from?: Date;
  to?: Date;
  assignedTo?: string;
  createdBy?: string;
  status?: string;
  tags?: string[];
};
