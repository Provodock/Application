import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UsersService } from '../users/users.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly usersService;
    constructor(eventsService: EventsService, usersService: UsersService);
    getAll(req: any, tags?: string): Promise<({
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    } | {
        isJoined: boolean;
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    })[]>;
    getOne(id: string, req: any): Promise<{
        participants: {
            id: string;
            email: string;
        }[];
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    } | {
        isJoined: boolean;
        participants: {
            id: string;
            email: string;
        }[];
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    }>;
    create(dto: CreateEventDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    }>;
    update(id: string, dto: UpdateEventDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        visibility: "public" | "private";
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
        tags: {
            id: string;
            name: string;
        }[];
    }>;
    remove(id: string, req: any): Promise<void>;
    join(id: string, req: any): Promise<{
        success: boolean;
        participantsCount: number;
        isFull: boolean;
    }>;
    leave(id: string, req: any): Promise<{
        success: boolean;
        participantsCount: number;
        isFull: boolean;
    }>;
}
