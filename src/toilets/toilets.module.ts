import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ToiletsService } from './toilets.service';
import { ToiletsController } from './toilets.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ToiletsController],
  providers: [ToiletsService],
  exports: [ToiletsService],
})
export class ToiletsModule {}