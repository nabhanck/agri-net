import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user, hashes password with bcrypt, and issues a JWT token.
   */
  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const { email, password, first_name, last_name, phone_number, role, preferred_language } =
      signupDto;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone_number: phone_number?.trim(),
      role: role ?? 'farmer',
      preferred_language: preferred_language ?? 'en',
    });

    const savedUser = await this.userRepository.save(newUser);

    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      message: 'User registered successfully',
      access_token,
      user: userWithoutPassword,
    };
  }

  /**
   * Authenticates user with email & password and issues a JWT token.
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Query user including the hidden password field
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      access_token,
      user: userWithoutPassword,
    };
  }

  /**
   * Returns authenticated user profile by ID.
   */
  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
