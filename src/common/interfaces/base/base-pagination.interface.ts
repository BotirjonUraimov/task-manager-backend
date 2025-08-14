export interface IBasePaginationResDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
