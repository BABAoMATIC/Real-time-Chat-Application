"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.ENV = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
};
//# sourceMappingURL=env.js.map