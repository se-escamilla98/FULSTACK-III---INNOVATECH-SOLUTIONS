"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    // Obtenemos el token
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        // FORZAMOS EL SECRETO: Usamos 'any' para que el compilador no valide el process.env
        const secret = process.env.JWT_SECRET || 'innovatech-secret-key-2026';
        // VERIFICAMOS: Usamos 'any' en el verify
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // ASIGNAMOS: Usamos 'any' en el request
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
exports.verifyToken = verifyToken;
