import { Module } from '@nestjs/common';
import { ConstantsController } from './constants.controller';
import { ConstantsService } from './constants.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConstantsController],
  providers: [ConstantsService],
  exports: [ConstantsService],
})
export class ConstantsModule {}
