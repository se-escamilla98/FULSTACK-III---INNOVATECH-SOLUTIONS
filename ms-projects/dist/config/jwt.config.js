"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = void 0;
exports.JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'innovatech-secret-key-2026',
    expiresIn: '24h'
};
