import { EventsService } from '../events/events.service';
export declare class MeController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getMyEvents(req: any, _view?: 'month' | 'week', _fromDate?: string, _toDate?: string): Promise<{
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
}
