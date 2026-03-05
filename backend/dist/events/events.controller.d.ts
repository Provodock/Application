import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UsersService } from '../users/users.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly usersService;
    constructor(eventsService: EventsService, usersService: UsersService);
    getAll(): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
    }[]>;
    getOne(id: string, req: any): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
    } | {
        isJoined: boolean;
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
    }>;
    create(dto: CreateEventDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
    }>;
    update(id: string, dto: UpdateEventDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | undefined;
        date: Date;
        location: string;
        capacity: number;
        organizer: {
            id: string;
            email: string;
        } | undefined;
        participantsCount: number;
        isFull: boolean;
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
    getMyEvents(req: any): Promise<{
        id: string;
        title: string;
        date: Date;
        location: string;
        role: string;
        participantsCount: number;
        isFull: boolean;
    }[]>;
}
