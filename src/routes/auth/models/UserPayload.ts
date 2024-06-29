export interface UserPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}
