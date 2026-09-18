import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiHandler from './api/index';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount Serverless URA dataset API endpoints
  app.all('/api/properties*', async (req, res) => {
    try {
      await apiHandler(req, res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Server error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.all('/api/ura*', async (req, res) => {
    try {
      await apiHandler(req, res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Server error';
      res.status(500).json({ success: false, error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Property Server running on port ${PORT}`);
  });
}

startServer();
