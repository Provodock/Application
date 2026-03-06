import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column()
  location!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'varchar', length: 10, default: 'public' })
  visibility!: 'public' | 'private';

  @ManyToOne(() => User, (user) => user.organizedEvents, { eager: true })
  organizer!: User;

  @ManyToMany(() => User, (user) => user.events, { eager: true })
  @JoinTable({
    name: 'event_participants',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants!: User[];
}

