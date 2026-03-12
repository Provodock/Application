import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';
export declare class Event {
    id: string;
    title: string;
    description?: string;
    date: Date;
    location: string;
    capacity: number;
    visibility: 'public' | 'private';
    organizer: User;
    participants: User[];
    tags: Tag[];
}
