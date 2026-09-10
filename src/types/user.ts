export type UserRole = 'ADMIN' | 'SELLER';

/** Соответствует UserView */
export interface UserView {
  id: number;
  email: string;
  fullname: string;
  role: UserRole;
}

/** Соответствует UserCreate — тело запроса POST /api/v1/users/ */
export interface UserCreate {
  email: string;
  fullname: string;
  password: string;
  role: UserRole;
}
