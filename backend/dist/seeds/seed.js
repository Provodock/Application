"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const user_entity_1 = require("../users/user.entity");
const event_entity_1 = require("../events/event.entity");
const bcrypt = __importStar(require("bcryptjs"));
async function run() {
    await data_source_1.AppDataSource.initialize();
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const eventRepo = data_source_1.AppDataSource.getRepository(event_entity_1.Event);
    await data_source_1.AppDataSource.query('TRUNCATE TABLE "event_participants", "events", "users" RESTART IDENTITY CASCADE;');
    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('password456', 10);
    const alice = userRepo.create({ email: 'alice@example.com', password: password1 });
    const bob = userRepo.create({ email: 'bob@example.com', password: password2 });
    await userRepo.save([alice, bob]);
    const now = new Date();
    const event1 = eventRepo.create({
        title: 'Tech Meetup',
        description: 'Informal meetup about new web technologies.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: 'Kyiv',
        capacity: 50,
        organizer: alice,
        participants: [alice, bob],
    });
    const event2 = eventRepo.create({
        title: 'Design Workshop',
        description: 'Hands-on workshop on UX/UI best practices.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        location: 'Lviv',
        capacity: 20,
        organizer: bob,
        participants: [bob],
    });
    const event3 = eventRepo.create({
        title: 'Online Webinar: NestJS Basics',
        description: 'Introduction to NestJS for building scalable backends.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        location: 'Online',
        capacity: 100,
        organizer: alice,
        participants: [],
    });
    await eventRepo.save([event1, event2, event3]);
    console.log('Seed data created:');
    console.log('Users:', await userRepo.find());
    console.log('Events:', await eventRepo.find());
    await data_source_1.AppDataSource.destroy();
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map