import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';

const PAST_EVENTS_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) { }

  onModuleInit() {
    this.removePastEvents().catch(() => { });
    setInterval(() => this.removePastEvents().catch(() => { }), PAST_EVENTS_CLEANUP_INTERVAL_MS);
  }

  async removePastEvents(): Promise<number> {
    const now = new Date();
    const past = await this.eventsRepository.find({
      where: { date: LessThan(now) as any },
    });
    if (past.length > 0) {
      await this.eventsRepository.remove(past);
    }
    return past.length;
  }

  async findAll(currentUserId?: string) {
    const now = new Date();
    const qb = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.date >= :now', { now });

    if (currentUserId) {
      qb.andWhere(
        '(event.visibility = :pub OR (event.visibility = :priv AND organizer.id = :uid))',
        { pub: 'public', priv: 'private', uid: currentUserId },
      );
    } else {
      qb.andWhere('event.visibility = :pub', { pub: 'public' });
    }

    const events = await qb.orderBy('event.date', 'ASC').getMany();
    return events.map((event) => {
      const base = this.toPublicEvent(event);
      if (currentUserId) {
        const isJoined = (event.participants || []).some((p) => p.id === currentUserId);
        return { ...base, isJoined };
      }
      return base;
    });
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
    const visibility = dto.visibility || 'public';
    const event = this.eventsRepository.create({
      ...dto,
      date: eventDate,
      capacity,
      visibility,
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
    if (dto.capacity !== undefined) {
      const currentParticipants = event.participants?.length || 0;
      if (dto.capacity < currentParticipants) {
        throw new BadRequestException(
          `Cannot set capacity to ${dto.capacity}: there are already ${currentParticipants} participants`,
        );
      }
      event.capacity = dto.capacity;
    }
    if (dto.visibility !== undefined) event.visibility = dto.visibility;

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
    const now = new Date();
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participant')
      .where('event.date >= :now AND (organizer.id = :userId OR participant.id = :userId)', {
        now,
        userId,
      })
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
      visibility: event.visibility || 'public',
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

