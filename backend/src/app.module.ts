import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { MeModule } from './me/me.module';
import { TagsModule } from './tags/tags.module';
import { ChatModule } from './chat/chat.module';

import { User } from './users/user.entity';
import { Event } from './events/event.entity';
import { Tag } from './tags/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'event_manager',
      entities: [User, Event, Tag],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    MeModule,
    TagsModule,
    ChatModule,
  ],
})
export class AppModule {}


