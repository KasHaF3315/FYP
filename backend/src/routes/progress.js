import { Router } from 'express';
import { GameProgress } from '../models/GameProgress.js';
import { authChild } from '../middleware/auth.js';

const router = Router();
const defaultModules = {
  scamSafari: {
    completedLevels: [],
    scam_score: 0,
    mistake_patterns: [],
    reaction_time: 0,
    rewards: [],
    difficulty: 1,
  },
  privacyVillage: {
    completedLevels: [],
    privacy_score: 0,
    mistake_patterns: [],
    reaction_time: 0,
    rewards: [],
    difficulty: 1,
  },
  cyberbullyBattle: {
    completedLevels: [],
    behavior_score: 0,
    response_accuracy: 0,
    decision_speed: 0,
    rewards: [],
    difficulty: 1,
  },
};

// GET /api/progress — child auth
router.get('/', authChild, async (req, res) => {
  try {
    let doc = await GameProgress.findOne({ childId: req.child._id });
    if (!doc) {
      doc = await GameProgress.create({
        childId: req.child._id,
        completedLevels: [],
        lastPlayed: new Date().toISOString(),
        modules: defaultModules,
        inventory: [],
        totalScore: 0,
      });
    }
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
    });
  } catch (e) {
    console.error('GET /progress', e);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// PUT /api/progress — child auth
router.put('/', authChild, async (req, res) => {
  try {
    const { completedLevels, lastPlayed, modules, inventory, totalScore } = req.body;
    const doc = await GameProgress.findOneAndUpdate(
      { childId: req.child._id },
      {
        completedLevels: Array.isArray(completedLevels) ? completedLevels : [],
        lastPlayed: typeof lastPlayed === 'string' ? lastPlayed : new Date().toISOString(),
        modules: typeof modules === 'object' && modules ? { ...defaultModules, ...modules } : defaultModules,
        inventory: Array.isArray(inventory) ? inventory : [],
        totalScore: typeof totalScore === 'number' ? totalScore : 0,
      },
      { new: true, upsert: true }
    );
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
    });
  } catch (e) {
    console.error('PUT /progress', e);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
