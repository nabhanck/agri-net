import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name!: string;

  @IsEmail({}, { message: 'Invalid email address format' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  @IsIn(['farmer', 'agronomist', 'admin'], {
    message: 'Role must be farmer, agronomist, or admin',
  })
  role?: 'farmer' | 'agronomist' | 'admin';

  @IsString()
  @IsOptional()
  preferred_language?: string;
}
