import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SnsService } from 'src/common/services/sns.service';
import { OtpService } from 'src/common/services/otp.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService,SnsService,OtpService]
})
export class AuthModule {}
