import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';
import { TagsService } from '../tags/tags.service';
export declare class EventsService implements OnModuleInit {
    private readonly eventsRepository;
    private readonly tagsService;
    constructor(eventsRepository: Repository<Event>, tagsService: TagsService);
    onModuleInit(): void;
    removePastEvents(): Promise<number>;
    findAll(currentUserId?: string, tagIds?: string[]): Promise<({
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
    findOne(id: string, currentUserId?: string): Promise<{
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
    create(dto: CreateEventDto, organizer: User): Promise<{
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
    update(id: string, dto: UpdateEventDto, userId: string): Promise<{
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
        tags: {
            id: string;
            name: string;
        }[];
    }[]>;
    private toPublicEvent;
    private buildParticipationResponse;
}
