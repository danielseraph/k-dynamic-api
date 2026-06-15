"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const vesselRoutes_1 = __importDefault(require("./routes/vesselRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
// Serve uploaded static assets
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes mapping
app.use('/api/auth', authRoutes_1.default);
app.use('/api/vessels', vesselRoutes_1.default);
app.use('/api/team', teamRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
