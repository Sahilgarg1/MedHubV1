import { Module } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { AuthService } from './services/auth.service';

@Module({
  providers: [DatabaseService, AuthService],
  exports: [DatabaseService, AuthService],
})
export class CommonModule {}
