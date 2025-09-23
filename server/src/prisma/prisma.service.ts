import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // 🚀 CONNECTION POOLING: Optimize database connections
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pool settings
      log: ['query', 'info', 'warn', 'error'],
      // Optimize for batch operations
      transactionOptions: {
        maxWait: 10000, // 10 seconds
        timeout: 30000, // 30 seconds
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}