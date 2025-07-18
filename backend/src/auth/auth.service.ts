import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { CreateUserDto, CreateCompanyDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: Omit<User, 'password'>; access_token: string; refresh_token: string }> {
    const { email, password, name, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      role: role || UserRole.STUDENT,
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Refresh token
    const refresh_token = this.refreshTokenService.generateRefreshToken();
    await this.refreshTokenService.storeRefreshToken(user.id, refresh_token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
      refresh_token,
    };
  }

  async registerCompany(createCompanyDto: CreateCompanyDto): Promise<{ user: Omit<User, 'password'>; access_token: string; refresh_token: string }> {
    const { email, password, companyName } = createCompanyDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create company user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name: companyName,
      company: companyName,
      role: UserRole.COMPANY,
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Refresh token
    const refresh_token = this.refreshTokenService.generateRefreshToken();
    await this.refreshTokenService.storeRefreshToken(user.id, refresh_token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
      refresh_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; access_token: string; refresh_token: string }> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Refresh token
    const refresh_token = this.refreshTokenService.generateRefreshToken();
    await this.refreshTokenService.storeRefreshToken(user.id, refresh_token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
      refresh_token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateOAuthUser(oauthUser: {
    googleId?: string;
    githubId?: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
  }): Promise<{ user: Omit<User, 'password'>; access_token: string; refresh_token: string }> {
    let user: User | null = null;

    // Try to find user by OAuth ID first
    if (oauthUser.googleId) {
      user = await this.usersService.findByGoogleId(oauthUser.googleId);
    } else if (oauthUser.githubId) {
      user = await this.usersService.findByGithubId(oauthUser.githubId);
    }

    // If not found by OAuth ID, try to find by email
    if (!user) {
      user = await this.usersService.findByEmail(oauthUser.email);
      
      // If user exists with email but no OAuth ID, link the accounts
      if (user) {
        const updateData: any = { provider: oauthUser.provider };
        if (oauthUser.googleId) updateData.googleId = oauthUser.googleId;
        if (oauthUser.githubId) updateData.githubId = oauthUser.githubId;
        if (oauthUser.avatar && !user.avatar) updateData.avatar = oauthUser.avatar;
        
        user = await this.usersService.update(user.id, updateData);
      }
    }

    // If user still not found, create a new one
    if (!user) {
      const createUserData: any = {
        email: oauthUser.email,
        name: oauthUser.name,
        provider: oauthUser.provider,
        role: UserRole.STUDENT,
      };
      
      if (oauthUser.googleId) createUserData.googleId = oauthUser.googleId;
      if (oauthUser.githubId) createUserData.githubId = oauthUser.githubId;
      if (oauthUser.avatar) createUserData.avatar = oauthUser.avatar;
      
      user = await this.usersService.createOAuthUser(createUserData);
    }

    // At this point, user should never be null
    if (!user) {
      throw new UnauthorizedException('Failed to create or find user');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Generate refresh token
    const refresh_token = this.refreshTokenService.generateRefreshToken();
    await this.refreshTokenService.storeRefreshToken(user.id, refresh_token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
      refresh_token,
    };
  }
}