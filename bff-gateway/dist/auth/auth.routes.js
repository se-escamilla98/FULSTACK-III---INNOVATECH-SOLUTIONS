"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /auth/login:
 * post:
 * summary: Iniciar sesión y obtener token JWT
 * tags: [Autenticación]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - apiKey
 * - role
 * properties:
 * apiKey:
 * type: string
 * example: admin-key-innovatech
 * role:
 * type: string
 * example: admin
 * responses:
 * 200:
 * description: Login exitoso, retorna el token JWT
 * 401:
 * description: API Key inválida
 */
// POST /auth/login -> genera un JWT
router.post('/auth/login', (req, res) => {
    const { apiKey, role } = req.body;
    // Validar apiKey (en produccion esto vendria de una BD)
    const validKeys = {
        'admin-key-innovatech': 'admin',
        'reader-key-innovatech': 'reader'
    };
    if (!apiKey || !validKeys[apiKey]) {
        return res.status(401).json({ error: 'API Key invalida' });
    }
    const assignedRole = validKeys[apiKey];
    const token = jsonwebtoken_1.default.sign({
        role: assignedRole,
        service: 'innovatech-bff',
    }, jwt_config_1.JWT_CONFIG.secret, { expiresIn: '24h' });
    res.json({
        token,
        role: assignedRole,
        expiresIn: '24h',
        message: `Bienvenido, rol ${assignedRole} autorizado`
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map