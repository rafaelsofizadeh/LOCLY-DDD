import { Module } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { OrderModule } from './order/infrastructure/di/OrderModule';

@Module({
  imports: [
    MongoModule.forRoot(
      'mongodb+srv://rafasofizada:METUclass2022@cluster0.tcrn6.mongodb.net/test?authSource=admin&replicaSet=atlas-zrpmay-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
      'locly',
    ),
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
