import { User } from '../users/user.entity';
export declare class Event {
    id: string;
    title: string;
    description?: string;
    date: Date;
    location: string;
    capacity: number;
    organizer: User;
    participants: User[];
}
