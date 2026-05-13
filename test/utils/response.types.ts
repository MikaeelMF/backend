export interface DataBody<T> {
  data: T;
}

export interface ErrorBody {
  code: string;
  details?: Record<string, unknown>;
  status: number;
}

export interface ListBody<T> {
  data: T[];
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface TodoItem {
  completed: boolean;
  description?: string;
  id: string;
  title: string;
}
