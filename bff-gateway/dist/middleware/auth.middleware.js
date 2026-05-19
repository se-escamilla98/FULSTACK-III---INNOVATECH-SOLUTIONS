"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
// Middleware que verifica que el token es valido
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_config_1.JWT_CONFIG.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token invalido o expirado.' });
    }
};
exports.verifyToken = verifyToken;
// Middleware que verifica que el rol tiene permiso
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map