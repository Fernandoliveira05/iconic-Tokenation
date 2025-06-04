import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // corrigido aqui
import { SuiService } from './sui.service';

@Module({
  imports: [HttpModule],
  providers: [SuiService],
  exports: [SuiService],
})
export class SuiModule {}
