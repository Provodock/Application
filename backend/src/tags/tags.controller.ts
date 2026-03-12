import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Get()
  getAll() {
    return this.tagsService.findAll();
  }

  @Post()
  create(@Body() dto: import('./dto/create-tag.dto').CreateTagDto) {
    return this.tagsService.findOrCreate(dto.name, dto.imageUrl);
  }
}
