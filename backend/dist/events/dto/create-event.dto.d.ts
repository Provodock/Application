export declare class CreateEventDto {
    title: string;
    description?: string;
    date: string;
    location: string;
    capacity?: number;
    visibility?: 'public' | 'private';
    tagIds?: string[];
}
