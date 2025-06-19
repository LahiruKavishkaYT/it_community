import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
        company: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Alias for findById to match the requirement
  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    return this.findById(id);
  }

  async create(userData: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
        company: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
} 