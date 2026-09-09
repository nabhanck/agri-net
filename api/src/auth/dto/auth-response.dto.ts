import { User } from 'src/user/entities/user.entity';

export interface AuthResponse {
  message: string;
  access_token: string;
  user: Omit<User, 'password'>;
}
