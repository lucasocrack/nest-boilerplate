export interface UserPayload {
  sub: string;
  email: string;
  username: string;
  role: number;
  iat?: number;
  exp?: number;
}
