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
let EventsService = class EventsService {
    constructor(eventsRepository) {
        this.eventsRepository = eventsRepository;
    }
    async findAll() {
        const events = await this.eventsRepository.find({
            order: { date: 'ASC' },
        });
        return events.map((event) => this.toPublicEvent(event));
    }
    async findOne(id, currentUserId) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['participants', 'organizer'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const base = this.toPublicEvent(event);
        if (currentUserId) {
            const isJoined = event.participants.some((p) => p.id === currentUserId);
            return { ...base, isJoined };
        }
        return base;
    }
    async create(dto, organizer) {
        const eventDate = new Date(dto.date);
        if (eventDate.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Event date must be in the future');
        }
        const event = this.eventsRepository.create({
            ...dto,
            date: eventDate,
            organizer,
            participants: [],
        });
        const saved = await this.eventsRepository.save(event);
        return this.toPublicEvent(saved);
    }
    async update(id, dto, userId) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer', 'participants'],
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
        if (dto.capacity !== undefined)
            event.capacity = dto.capacity;
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
            relations: ['participants', 'organizer'],
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
            relations: ['participants', 'organizer'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        event.participants = event.participants.filter((p) => p.id !== user.id);
        const saved = await this.eventsRepository.save(event);
        return this.buildParticipationResponse(saved);
    }
    async findForUser(userId) {
        const events = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.participants', 'participant')
            .where('organizer.id = :userId', { userId })
            .orWhere('participant.id = :userId', { userId })
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
            };
        });
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
            organizer: event.organizer
                ? { id: event.organizer.id, email: event.organizer.email }
                : undefined,
            participantsCount,
            isFull,
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map