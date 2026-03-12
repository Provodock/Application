export type PublicEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  visibility: 'public' | 'private';
  organizer?: { id: string; email: string };
  participantsCount: number;
  isFull: boolean;
  isJoined?: boolean;
  tags?: { id: string; name: string; imageUrl?: string }[];
};

export type EventDetails = PublicEvent & {
  isJoined?: boolean;
  participants?: { id: string; email: string }[];
};

export type MyEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  role: 'organizer' | 'participant';
  participantsCount: number;
  isFull: boolean;
  tags?: { id: string; name: string; imageUrl?: string }[];
};

