import { Event } from '../events/event.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    organizedEvents: Event[];
    events: Event[];
}
