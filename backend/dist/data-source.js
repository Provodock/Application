"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./users/user.entity");
const event_entity_1 = require("./events/event.entity");
const tag_entity_1 = require("./tags/tag.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'event_manager',
    entities: [user_entity_1.User, event_entity_1.Event, tag_entity_1.Tag],
    synchronize: true,
    logging: false,
});
//# sourceMappingURL=data-source.js.map