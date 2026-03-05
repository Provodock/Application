import { AppDataSource } from '../data-source';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import * as bcrypt from 'bcryptjs';

async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const eventRepo = AppDataSource.getRepository(Event);

  // Clean tables (including join table) before inserting fresh data
  await AppDataSource.query(
    'TRUNCATE TABLE "event_participants", "events", "users" RESTART IDENTITY CASCADE;',
  );

  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('password456', 10);

  const alice = userRepo.create({ email: 'alice@example.com', password: password1 });
  const bob = userRepo.create({ email: 'bob@example.com', password: password2 });

  await userRepo.save([alice, bob]);

  const now = new Date();

  const event1 = eventRepo.create({
    title: 'Tech Meetup',
    description: 'Informal meetup about new web technologies.',
    date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    location: 'Kyiv',
    capacity: 50,
    organizer: alice,
    participants: [alice, bob],
  });

  const event2 = eventRepo.create({
    title: 'Design Workshop',
    description: 'Hands-on workshop on UX/UI best practices.',
    date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    location: 'Lviv',
    capacity: 20,
    organizer: bob,
    participants: [bob],
  });

  const event3 = eventRepo.create({
    title: 'Online Webinar: NestJS Basics',
    description: 'Introduction to NestJS for building scalable backends.',
    date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    location: 'Online',
    capacity: 100,
    organizer: alice,
    participants: [],
  });

  await eventRepo.save([event1, event2, event3]);

  // eslint-disable-next-line no-console
  console.log('Seed data created:');
  console.log('Users:', await userRepo.find());
  console.log('Events:', await eventRepo.find());

  await AppDataSource.destroy();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

