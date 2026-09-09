import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'farmer@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'farmer',
  };

  const mockAuthResponse = {
    message: 'Success',
    access_token: 'mock_jwt_token',
    user: mockUser as User,
  };

  beforeEach(async () => {
    authService = {
      signup: jest.fn().mockResolvedValue(mockAuthResponse),
      login: jest.fn().mockResolvedValue(mockAuthResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup and return auth response', async () => {
      const dto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'farmer@example.com',
        password: 'Password123!',
      };

      const result = await controller.signup(dto);
      expect(authService.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return auth response', async () => {
      const dto = {
        email: 'farmer@example.com',
        password: 'Password123!',
      };

      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getProfile', () => {
    it('should return profile from request user', () => {
      const result = controller.getProfile(mockUser as User);
      expect(result).toEqual({
        message: 'Profile retrieved successfully',
        user: mockUser,
      });
    });
  });
});
