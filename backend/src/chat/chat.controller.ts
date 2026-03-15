import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async handleChat(@Body('messages') messages: any[], @Req() req: any) {
    return this.chatService.processChat(messages, req.user);
  }
}
