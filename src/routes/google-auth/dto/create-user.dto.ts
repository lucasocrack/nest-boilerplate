export class CreateUserDto {
  id?: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean = true;
  role: string = 'CLIENT';
  createdAt: Date;
}
