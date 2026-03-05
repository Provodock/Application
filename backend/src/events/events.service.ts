import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async findAll() {
    const events = await this.eventsRepository.find({
      order: { date: 'ASC' },
    });
    return events.map((event) => this.toPublicEvent(event));
  }

  async findOne(id: string, currentUserId?: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['participants', 'organizer'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const base = this.toPublicEvent(event);
    const participants = (event.participants || []).map((p) => ({
      id: p.id,
      email: p.email,
    }));
    const result = { ...base, participants };
    if (currentUserId) {
      const isJoined = event.participants.some((p) => p.id === currentUserId);
      return { ...result, isJoined };
    }
    return result;
  }

  async create(dto: CreateEventDto, organizer: User) {
    const eventDate = new Date(dto.date);
    if (eventDate.getTime() <= Date.now()) {
      throw new BadRequestException('Event date must be in the future');
    }
    const capacity = dto.capacity != null && dto.capacity > 0 ? dto.capacity : 999999;
    const event = this.eventsRepository.create({
      ...dto,
      date: eventDate,
      capacity,
      organizer,
      participants: [],
    });
    const saved = await this.eventsRepository.save(event);
    return this.toPublicEvent(saved);
  }

  async update(id: string, dto: UpdateEventDto, userId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Only organizer can update event');
    }
    if (dto.date) {
      const eventDate = new Date(dto.date);
      if (eventDate.getTime() <= Date.now()) {
        throw new BadRequestException('Event date must be in the future');
      }
      event.date = eventDate;
    }
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.capacity !== undefined) event.capacity = dto.capacity;

    const saved = await this.eventsRepository.save(event);
    return this.toPublicEvent(saved);
  }

  async remove(id: string, userId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Only organizer can delete event');
    }
    await this.eventsRepository.remove(event);
  }

  async join(eventId: string, user: User) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['participants', 'organizer'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const participantsCount = event.participants.length;
    if (participantsCount >= event.capacity) {
      throw new BadRequestException('Event is full');
    }
    const alreadyJoined = event.participants.some((p) => p.id === user.id);
    if (alreadyJoined) {
      return this.buildParticipationResponse(event);
    }
    event.participants.push(user);
    const saved = await this.eventsRepository.save(event);
    return this.buildParticipationResponse(saved);
  }

  async leave(eventId: string, user: User) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['participants', 'organizer'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    event.participants = event.participants.filter((p) => p.id !== user.id);
    const saved = await this.eventsRepository.save(event);
    return this.buildParticipationResponse(saved);
  }

  async findForUser(userId: string) {
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participant')
      .where('organizer.id = :userId', { userId })
      .orWhere('participant.id = :userId', { userId })
      .orderBy('event.date', 'ASC')
      .getMany();

    return events.map((event) => {
      const participantsCount = event.participants?.length || 0;
      const isFull = participantsCount >= event.capacity;
      const role =
        event.organizer && event.organizer.id === userId
          ? 'organizer'
          : 'participant';
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        role,
        participantsCount,
        isFull,
      };
    });
  }

  private toPublicEvent(event: Event) {
    const participantsCount = event.participants?.length || 0;
    const isFull = participantsCount >= event.capacity;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      organizer: event.organizer
        ? { id: event.organizer.id, email: event.organizer.email }
        : undefined,
      participantsCount,
      isFull,
    };
  }

  private buildParticipationResponse(event: Event) {
    const participantsCount = event.participants?.length || 0;
    const isFull = participantsCount >= event.capacity;
    return {
      success: true,
      participantsCount,
      isFull,
    };
  }
}

