import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';
export declare class EventsService {
    private readonly eventsRepository;
    constructor(eventsRepository: Repository<Event>);
    findAll(): Promise<{
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
    findOne(id: string, currentUserId?: string): Promise<{
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
    create(dto: CreateEventDto, organizer: User): Promise<{
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
    update(id: string, dto: UpdateEventDto, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<void>;
    join(eventId: string, user: User): Promise<{
        success: boolean;
        participantsCount: number;
        isFull: boolean;
    }>;
    leave(eventId: string, user: User): Promise<{
        success: boolean;
        participantsCount: number;
        isFull: boolean;
    }>;
    findForUser(userId: string): Promise<{
        id: string;
        title: string;
        date: Date;
        location: string;
        role: string;
        participantsCount: number;
        isFull: boolean;
    }[]>;
    private toPublicEvent;
    private buildParticipationResponse;
}
