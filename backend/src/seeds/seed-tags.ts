import { DataSource } from 'typeorm';
import { Tag } from '../tags/tag.entity';

const DEFAULT_TAGS = [
  'Tech',
  'Art',
  'Business',
  'Music',
  'Sports',
  'Education',
  'Health',
  'Food',
];

export async function seedTags(dataSource: DataSource) {
  const repo = dataSource.getRepository(Tag);
  for (const name of DEFAULT_TAGS) {
    const exists = await repo.findOne({ where: { name } });
    if (!exists) {
      await repo.save(repo.create({ name }));
    }
  }
  console.log('Tags seeded');
}
