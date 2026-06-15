import { Router } from 'express';
import { Child } from '../models/Child.js';
import { GameProgress } from '../models/GameProgress.js';
import { Parent } from '../models/Parent.js';
import { authParent } from '../middleware/auth.js';

const router = Router();

// PUT /api/parent/password — change password while logged in
router.put('/password', authParent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const parent = await Parent.findById(req.parent._id).select('+password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    const ok = await parent.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    parent.password = newPassword;
    await parent.save();
    res.json({ ok: true, message: 'Password updated successfully.' });
  } catch (e) {
    console.error('PUT /parent/password', e);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

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

// GET /api/parent/children — parent auth
router.get('/children', authParent, async (req, res) => {
  try {
    const list = await Child.find({ parentId: req.parent._id }).lean();
    const arr = list.map((c) => ({
      ...c,
      id: c._id.toString(),
      parentId: c.parentId?.toString?.() || c.parentId,
    }));
    res.json(arr);
  } catch (e) {
    console.error('GET /parent/children', e);
    res.status(500).json({ error: 'Failed to load children' });
  }
});

// GET /api/parent/child/:childId/progress — parent auth (only their children)
router.get('/child/:childId/progress', authParent, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.childId,
      parentId: req.parent._id,
    });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    let doc = await GameProgress.findOne({ childId: child._id });
    if (!doc) {
      doc = { completedLevels: [], lastPlayed: '', modules: defaultModules, inventory: [], totalScore: 0 };
    }
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
    });
  } catch (e) {
    console.error('GET /parent/child/:id/progress', e);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

export default router;
