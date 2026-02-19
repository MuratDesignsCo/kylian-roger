import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import multer from 'multer';
import fs from 'fs';
import typeDefs from './schema/typeDefs.js';
import resolvers from './schema/resolvers/index.js';
import { buildContext, getTokenFromRequest, verifyToken } from './auth.js';
const PORT = parseInt(process.env.PORT || '4000', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || `http://localhost:${PORT}/uploads`;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 100 * 1024 * 1024;
// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const app = express();
// CORS
app.use(cors({
    origin: CORS_ORIGIN.split(',').map(s => s.trim()),
    credentials: true,
}));
// Health check
app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
});
// Serve uploaded files (fallback when Caddy isn't configured)
app.use('/uploads', express.static(UPLOAD_DIR));
// File upload endpoint
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: VIDEO_MAX_SIZE },
});
app.post('/upload', upload.single('file'), (req, res) => {
    // Check auth
    const token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        verifyToken(token);
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
    if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
    }
    const isVideo = req.file.mimetype.startsWith('video/');
    const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;
    if (req.file.size > maxSize) {
        // Remove the file
        fs.unlinkSync(req.file.path);
        const maxLabel = isVideo ? '100MB' : '5MB';
        res.status(400).json({ error: `File too large. Maximum size is ${maxLabel}.` });
        return;
    }
    const fileUrl = `${UPLOAD_BASE_URL}/${req.file.filename}`;
    res.json({
        url: fileUrl,
        path: req.file.filename,
    });
});
// Apollo GraphQL
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
async function start() {
    await server.start();
    app.use('/graphql', express.json(), expressMiddleware(server, {
        context: async ({ req }) => buildContext(req),
    }));
    app.listen(PORT, () => {
        console.log(`API ready at http://localhost:${PORT}/graphql`);
        console.log(`Upload endpoint at http://localhost:${PORT}/upload`);
    });
}
start().catch(console.error);
//# sourceMappingURL=index.js.map