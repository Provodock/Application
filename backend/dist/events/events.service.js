"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./event.entity");
const tags_service_1 = require("../tags/tags.service");
const PAST_EVENTS_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let EventsService = class EventsService {
    constructor(eventsRepository, tagsService) {
        this.eventsRepository = eventsRepository;
        this.tagsService = tagsService;
    }
    onModuleInit() {
        this.removePastEvents().catch(() => { });
        setInterval(() => this.removePastEvents().catch(() => { }), PAST_EVENTS_CLEANUP_INTERVAL_MS);
    }
    async removePastEvents() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const past = await this.eventsRepository.find({
            where: { date: (0, typeorm_2.LessThan)(sevenDaysAgo) },
        });
        if (past.length > 0) {
            await this.eventsRepository.remove(past);
        }
        return past.length;
    }
    async findAll(currentUserId, tagIds) {
        const now = new Date();
        const qb = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.tags', 'tag')
            .where('event.date >= :now', { now });
        if (currentUserId) {
            qb.andWhere('(event.visibility = :pub OR (event.visibility = :priv AND organizer.id = :uid))', { pub: 'public', priv: 'private', uid: currentUserId });
        }
        else {
            qb.andWhere('event.visibility = :pub', { pub: 'public' });
        }
        if (tagIds && tagIds.length > 0) {
            qb.andWhere((qb2) => {
                const subQuery = qb2
                    .subQuery()
                    .select('et.event_id')
                    .from('event_tags', 'et')
                    .where('et.tag_id IN (:...tagIds)')
                    .getQuery();
                return `event.id IN ${subQuery}`;
            }).setParameter('tagIds', tagIds);
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
    async findOne(id, currentUserId) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['participants', 'organizer', 'tags'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
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
    async create(dto, organizer) {
        const eventDate = new Date(dto.date);
        if (eventDate.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Event date must be in the future');
        }
        const capacity = dto.capacity != null && dto.capacity > 0 ? dto.capacity : 999999;
        const visibility = dto.visibility || 'public';
        let tags = [];
        if (dto.tagIds && dto.tagIds.length > 0) {
            tags = await this.tagsService.findByIds(dto.tagIds);
        }
        const event = this.eventsRepository.create({
            title: dto.title,
            description: dto.description,
            date: eventDate,
            location: dto.location,
            capacity,
            visibility,
            organizer,
            participants: [],
            tags,
        });
        const saved = await this.eventsRepository.save(event);
        return this.toPublicEvent(saved);
    }
    async update(id, dto, userId) {
        var _a;
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer', 'participants', 'tags'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizer.id !== userId) {
            throw new common_1.ForbiddenException('Only organizer can update event');
        }
        if (dto.date) {
            const eventDate = new Date(dto.date);
            if (eventDate.getTime() <= Date.now()) {
                throw new common_1.BadRequestException('Event date must be in the future');
            }
            event.date = eventDate;
        }
        if (dto.title !== undefined)
            event.title = dto.title;
        if (dto.description !== undefined)
            event.description = dto.description;
        if (dto.location !== undefined)
            event.location = dto.location;
        if (dto.capacity !== undefined) {
            const currentParticipants = ((_a = event.participants) === null || _a === void 0 ? void 0 : _a.length) || 0;
            if (dto.capacity < currentParticipants) {
                throw new common_1.BadRequestException(`Cannot set capacity to ${dto.capacity}: there are already ${currentParticipants} participants`);
            }
            event.capacity = dto.capacity;
        }
        if (dto.visibility !== undefined)
            event.visibility = dto.visibility;
        if (dto.tagIds !== undefined) {
            if (dto.tagIds.length > 0) {
                event.tags = await this.tagsService.findByIds(dto.tagIds);
            }
            else {
                event.tags = [];
            }
        }
        const saved = await this.eventsRepository.save(event);
        return this.toPublicEvent(saved);
    }
    async remove(id, userId) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizer.id !== userId) {
            throw new common_1.ForbiddenException('Only organizer can delete event');
        }
        await this.eventsRepository.remove(event);
    }
    async join(eventId, user) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['participants', 'organizer', 'tags'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const participantsCount = event.participants.length;
        if (participantsCount >= event.capacity) {
            throw new common_1.BadRequestException('Event is full');
        }
        const alreadyJoined = event.participants.some((p) => p.id === user.id);
        if (alreadyJoined) {
            return this.buildParticipationResponse(event);
        }
        event.participants.push(user);
        const saved = await this.eventsRepository.save(event);
        return this.buildParticipationResponse(saved);
    }
    async leave(eventId, user) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['participants', 'organizer', 'tags'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        event.participants = event.participants.filter((p) => p.id !== user.id);
        const saved = await this.eventsRepository.save(event);
        return this.buildParticipationResponse(saved);
    }
    async findForUser(userId) {
        const now = new Date();
        const events = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.tags', 'tag')
            .where('event.date >= :now AND (organizer.id = :userId OR participant.id = :userId)', {
            now,
            userId,
        })
            .orderBy('event.date', 'ASC')
            .getMany();
        return events.map((event) => {
            var _a;
            const participantsCount = ((_a = event.participants) === null || _a === void 0 ? void 0 : _a.length) || 0;
            const isFull = participantsCount >= event.capacity;
            const role = event.organizer && event.organizer.id === userId
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
                tags: (event.tags || []).map((t) => ({ id: t.id, name: t.name, imageUrl: t.imageUrl })),
            };
        });
    }
    async findArchived(tagIds) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const qb = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.tags', 'tag')
            .where('event.date < :now AND event.date >= :sevenDaysAgo', { now, sevenDaysAgo })
            .andWhere('event.visibility = :pub', { pub: 'public' });
        if (tagIds && tagIds.length > 0) {
            qb.andWhere((qb2) => {
                const subQuery = qb2
                    .subQuery()
                    .select('et.event_id')
                    .from('event_tags', 'et')
                    .where('et.tag_id IN (:...tagIds)')
                    .getQuery();
                return `event.id IN ${subQuery}`;
            }).setParameter('tagIds', tagIds);
        }
        const events = await qb.orderBy('event.date', 'DESC').getMany();
        return events.map((event) => this.toPublicEvent(event));
    }
    toPublicEvent(event) {
        var _a;
        const participantsCount = ((_a = event.participants) === null || _a === void 0 ? void 0 : _a.length) || 0;
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
            tags: (event.tags || []).map((t) => ({ id: t.id, name: t.name, imageUrl: t.imageUrl })),
        };
    }
    buildParticipationResponse(event) {
        var _a;
        const participantsCount = ((_a = event.participants) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const isFull = participantsCount >= event.capacity;
        return {
            success: true,
            participantsCount,
            isFull,
        };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tags_service_1.TagsService])
], EventsService);
//# sourceMappingURL=events.service.js.map