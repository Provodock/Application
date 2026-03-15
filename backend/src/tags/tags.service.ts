import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService implements OnModuleInit {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) { }

  async onModuleInit() {
    const predefined = [
      { name: 'Art', imageUrl: '🎨' },
      { name: 'Business', imageUrl: '💼' },
      { name: 'Charity', imageUrl: '💖' },
      { name: 'Cinema', imageUrl: '🎬' },
      { name: 'DIY', imageUrl: '🔧' },
      { name: 'Education', imageUrl: '📚' },
      { name: 'Fashion', imageUrl: '👗' },
      { name: 'Food', imageUrl: '🍔' },
      { name: 'Gaming', imageUrl: '🎮' },
      { name: 'Health', imageUrl: '💊' },
      { name: 'History', imageUrl: '🏛️' },
      { name: 'Literature', imageUrl: '📖' },
      { name: 'Music', imageUrl: '🎵' },
      { name: 'Pets', imageUrl: '🐾' },
      { name: 'Photography', imageUrl: '📷' },
      { name: 'Politics', imageUrl: '🏛️' },
      { name: 'Science', imageUrl: '🔬' },
      { name: 'Sports', imageUrl: '⚽' },
      { name: 'Tech', imageUrl: '💻' },
      { name: 'Travel', imageUrl: '✈️' },
      { name: 'Nature', imageUrl: '🌿' },
      { name: 'Fitness', imageUrl: '💪' },
      { name: 'Cooking', imageUrl: '🍳' },
      { name: 'Dance', imageUrl: '💃' },
      { name: 'Comedy', imageUrl: '😂' },
    ];

    for (const tag of predefined) {
      const existing = await this.tagsRepository
        .createQueryBuilder('tag')
        .where('LOWER(tag.name) = LOWER(:name)', { name: tag.name.trim() })
        .getOne();
        
      if (!existing) {
        await this.tagsRepository.save(this.tagsRepository.create(tag));
      } else if (existing.imageUrl !== tag.imageUrl) {
        existing.imageUrl = tag.imageUrl;
        await this.tagsRepository.save(existing);
      }
    }
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagsRepository.find({ where: { id: In(ids) } });
  }

  async findOrCreate(name: string, imageUrl?: string): Promise<Tag> {
    const trimmed = name.trim();
    const existing = await this.tagsRepository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name: trimmed })
      .getOne();

    if (existing) {
      if (imageUrl && !existing.imageUrl) {
        existing.imageUrl = imageUrl;
        return this.tagsRepository.save(existing);
      }
      return existing;
    }

    const newTag = this.tagsRepository.create({ name: trimmed, imageUrl });
    return this.tagsRepository.save(newTag);
  }
}
