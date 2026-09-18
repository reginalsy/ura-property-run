import express from 'express';
import dotenv from 'dotenv';
import apiHandler from './index';

// Load environment variables from .env
dotenv.config();

const router = express.Router();

// Mount universal serverless handler on /api/properties/*
router.all('/properties*', async (req, res) => {
  try {
    await apiHandler(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ success: false, error: message });
  }
});

// Also support direct /properties or /ura routes
router.all('/ura*', async (req, res) => {
  try {
    await apiHandler(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
