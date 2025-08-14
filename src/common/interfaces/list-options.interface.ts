export interface IListOptions {
  page?: number | 1;
  limit?: number | 20;
  sortBy?: string | "createdAt";
  sortOrder?: "asc" | "desc";
}
