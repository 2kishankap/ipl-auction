import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use('/api', createProxyMiddleware({ target: 'http://127.0.0.1:5001', changeOrigin: true }));
app.use('/socket.io', createProxyMiddleware({ target: 'http://127.0.0.1:5001', ws: true }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(4173, '0.0.0.0', () => console.log('Public server running on port 4173'));
