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
      { name: 'Art', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop' },
      { name: 'Business', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop' },
      { name: 'Charity', imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=200&h=200&fit=crop' },
      { name: 'Cinema', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop' },
      { name: 'DIY', imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=200&h=200&fit=crop' },
      { name: 'Education', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop' },
      { name: 'Fashion', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop' },
      { name: 'Food', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop' },
      { name: 'Gaming', imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop' },
      { name: 'Health', imageUrl: 'https://images.unsplash.com/photo-1505506874110-6a7a60998a43?w=200&h=200&fit=crop' },
      { name: 'History', imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop' },
      { name: 'Literature', imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=200&h=200&fit=crop' },
      { name: 'Music', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop' },
      { name: 'Pets', imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop' },
      { name: 'Photography', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop' },
      { name: 'Politics', imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=200&h=200&fit=crop' },
      { name: 'Science', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop' },
      { name: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop' },
      { name: 'Tech', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop' },
      { name: 'Travel', imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200&h=200&fit=crop' },
      { name: 'Nature', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop' },
      { name: 'Fitness', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { name: 'Cooking', imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=200&fit=crop' },
      { name: 'Dance', imageUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=200&h=200&fit=crop' },
      { name: 'Comedy', imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=200&h=200&fit=crop' },
    ];

    for (const tag of predefined) {
      const existing = await this.tagsRepository
        .createQueryBuilder('tag')
        .where('LOWER(tag.name) = LOWER(:name)', { name: tag.name.trim() })
        .getOne();
        
      if (!existing) {
        await this.tagsRepository.save(this.tagsRepository.create(tag));
      } else if (!existing.imageUrl) {
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
