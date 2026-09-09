import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: any;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'farmer@example.com',
    password: '$2a$10$hashedpasswordstringsample',
    first_name: 'John',
    last_name: 'Doe',
    role: 'farmer',
    phone_number: '+1234567890',
    preferred_language: 'en',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      createQueryBuilder: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_access_token_123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully register a new user and return JWT token', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const signupDto = {
        email: 'Farmer@Example.com',
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1234567890',
      };

      const result = await service.signup(signupDto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'farmer@example.com' },
      });
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'farmer@example.com',
        role: 'farmer',
      });
      expect(result).toHaveProperty('access_token', 'mock_jwt_access_token_123');
      expect(result).toHaveProperty('user');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email is already registered', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.signup({
          email: 'farmer@example.com',
          password: 'Password123!',
          first_name: 'John',
          last_name: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user with valid password and return token', async () => {
      const plainPassword = 'Password123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const userWithRealHash = { ...mockUser, password: hashedPassword };

      userRepo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userWithRealHash),
      });

      const result = await service.login({
        email: 'farmer@example.com',
        password: plainPassword,
      });

      expect(result.access_token).toBe('mock_jwt_access_token_123');
      expect(result.user.email).toBe('farmer@example.com');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      const userWithRealHash = { ...mockUser, password: hashedPassword };

      userRepo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userWithRealHash),
      });

      await expect(
        service.login({
          email: 'farmer@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile if found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });
});
