import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorHandler } from '../exceptions/custom.exceptions';

// Common database operations interface
export interface DatabaseOperations {
  findById<T>(entity: string, id: string | number): Promise<T | null>;
  findMany<T>(entity: string, where?: any, orderBy?: any, take?: number, skip?: number): Promise<T[]>;
  create<T>(entity: string, data: any): Promise<T>;
  update<T>(entity: string, id: string | number, data: any): Promise<T>;
  delete(entity: string, id: string | number): Promise<void>;
  exists(entity: string, where: any): Promise<boolean>;
  count(entity: string, where?: any): Promise<number>;
}

// Transaction wrapper interface
export interface TransactionWrapper {
  execute<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

@Injectable()
export class DatabaseService implements DatabaseOperations, TransactionWrapper {
  constructor(private prisma: PrismaService) {}

  // Generic find by ID
  async findById<T>(entity: string, id: string | number): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[entity].findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `findById for ${entity}`);
    }
  }

  // Generic find many
  async findMany<T>(
    entity: string, 
    where?: any, 
    orderBy?: any, 
    take?: number, 
    skip?: number
  ): Promise<T[]> {
    try {
      const result = await (this.prisma as any)[entity].findMany({
        where,
        orderBy,
        take,
        skip,
      });
      return result;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `findMany for ${entity}`);
    }
  }

  // Generic create
  async create<T>(entity: string, data: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[entity].create({
        data,
      });
      return result;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `create for ${entity}`);
    }
  }

  // Generic update
  async update<T>(entity: string, id: string | number, data: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[entity].update({
        where: { id },
        data,
      });
      return result;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `update for ${entity}`);
    }
  }

  // Generic delete
  async delete(entity: string, id: string | number): Promise<void> {
    try {
      await (this.prisma as any)[entity].delete({
        where: { id },
      });
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `delete for ${entity}`);
    }
  }

  // Check if entity exists
  async exists(entity: string, where: any): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[entity].count({ where });
      return count > 0;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `exists check for ${entity}`);
    }
  }

  // Count entities
  async count(entity: string, where?: any): Promise<number> {
    try {
      return await (this.prisma as any)[entity].count({ where });
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `count for ${entity}`);
    }
  }

  // Transaction wrapper
  async execute<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, 'transaction');
    }
  }

  // Batch operations
  async createMany<T>(entity: string, data: any[]): Promise<T[]> {
    try {
      const result = await (this.prisma as any)[entity].createMany({
        data,
        skipDuplicates: true,
      });
      return result as T[];
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `createMany for ${entity}`);
    }
  }

  async updateMany(entity: string, where: any, data: any): Promise<number> {
    try {
      const result = await (this.prisma as any)[entity].updateMany({
        where,
        data,
      });
      return result.count;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `updateMany for ${entity}`);
    }
  }

  async deleteMany(entity: string, where: any): Promise<number> {
    try {
      const result = await (this.prisma as any)[entity].deleteMany({
        where,
      });
      return result.count;
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `deleteMany for ${entity}`);
    }
  }

  // Pagination helper
  async findWithPagination<T>(
    entity: string,
    page: number = 1,
    limit: number = 10,
    where?: any,
    orderBy?: any
  ): Promise<{
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        (this.prisma as any)[entity].findMany({
          where,
          orderBy,
          take: limit,
          skip,
        }),
        (this.prisma as any)[entity].count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, `findWithPagination for ${entity}`);
    }
  }

  // Raw query helper
  async executeRaw<T>(query: string, params?: any[]): Promise<T[]> {
    try {
      return await this.prisma.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      ErrorHandler.handleDatabaseError(error, 'raw query');
    }
  }
}
