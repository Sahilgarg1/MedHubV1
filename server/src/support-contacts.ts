import { Injectable, Controller, Get, Param, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

// Service
@Injectable()
export class SupportContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supportContact.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findPrimary() {
    return this.prisma.supportContact.findFirst({
      where: {
        isActive: true,
        isPrimary: true,
      },
    });
  }

  async findByDepartment(department: string) {
    return this.prisma.supportContact.findMany({
      where: {
        isActive: true,
        department: department,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' },
      ],
    });
  }
}

// Controller
@Controller('support-contacts')
export class SupportContactsController {
  constructor(private readonly supportContactsService: SupportContactsService) {}

  @Get()
  findAll() {
    return this.supportContactsService.findAll();
  }

  @Get('primary')
  findPrimary() {
    return this.supportContactsService.findPrimary();
  }

  @Get('department/:department')
  findByDepartment(@Param('department') department: string) {
    return this.supportContactsService.findByDepartment(department);
  }
}

// Module
@Module({
  imports: [PrismaModule],
  controllers: [SupportContactsController],
  providers: [SupportContactsService],
  exports: [SupportContactsService],
})
export class SupportContactsModule {}
