import { Router } from 'express';
import { Parent } from '../models/Parent.js';
import { Child } from '../models/Child.js';
import { Admin } from '../models/Admin.js';
import { signParentToken, signChildToken, signAdminToken } from '../middleware/auth.js';

const router = Router();

function makeLoginCode() {
  return String(Math.floor(Math.random() * 90) + 10);
}

// POST /api/auth/parent/register
router.post('/parent/register', async (req, res) => {
  try {
    const { parentName, parentEmail, password, childName, childAge } = req.body;
    if (!parentName || !parentEmail || !password || !childName || !childAge) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const age = parseInt(childAge, 10);
    if (isNaN(age) || age < 1 || age > 18) {
      return res.status(400).json({ error: 'Child age must be 1–18' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await Parent.findOne({ email: parentEmail.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    let loginCode;
    let taken = true;
    while (taken) {
      loginCode = makeLoginCode();
      const c = await Child.findOne({ loginCode });
      if (!c) taken = false;
    }

    const parent = await Parent.create({
      name: (parentName || '').trim(),
      email: (parentEmail || '').toLowerCase().trim(),
      password,
    });

    const child = await Child.create({
      name: (childName || '').trim(),
      age,
      loginCode,
      parentId: parent._id,
    });

    const token = signParentToken(parent._id);
    const parentObj = parent.toObject();
    delete parentObj.password;
    const childObj = child.toObject();
    res.status(201).json({
      parent: { ...parentObj, id: parent._id.toString() },
      child: { ...childObj, id: child._id.toString(), parentId: parent._id.toString() },
      loginCode,
      token,
    });
  } catch (e) {
    console.error('parent/register', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/parent/login
router.post('/parent/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const parent = await Parent.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!parent) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await parent.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signParentToken(parent._id);
    const obj = parent.toObject();
    delete obj.password;
    res.json({ parent: { ...obj, id: parent._id.toString() }, token });
  } catch (e) {
    console.error('parent/login', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/parent/reset-password — demo-style reset by email (no email verification; suitable for local FYP only)
router.post('/parent/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const parent = await Parent.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (parent) {
      parent.password = newPassword;
      await parent.save();
    }
    res.json({ ok: true, message: 'If an account exists for that email, the password has been updated.' });
  } catch (e) {
    console.error('parent/reset-password', e);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// POST /api/auth/child/login
router.post('/child/login', async (req, res) => {
  try {
    const { name, loginCode } = req.body;
    if (!name || !loginCode) {
      return res.status(400).json({ error: 'Name and login code required' });
    }
    const code = String(loginCode).padStart(2, '0').slice(-2);
    const child = await Child.findOne({ loginCode: code });
    if (!child) return res.status(401).json({ error: 'Invalid login code. Please check with your parent.' });
    if (child.name.trim().toLowerCase() !== String(name).trim().toLowerCase()) {
      return res.status(401).json({ error: 'Name does not match the login code. Please try again.' });
    }
    const token = signChildToken(child._id);
    const obj = child.toObject();
    obj.id = child._id.toString();
    obj.parentId = child.parentId?.toString?.() || child.parentId;
    res.json({ child: obj, token });
  } catch (e) {
    console.error('child/login', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const normalizedUsername = String(username).trim();
    const dbAdmin = await Admin.findOne({ username: normalizedUsername }).select('+password');

    let isValid = false;
    let adminId = adminUsername;
    let adminName = adminUsername;

    if (dbAdmin) {
      isValid = await dbAdmin.comparePassword(String(password));
      adminId = dbAdmin._id.toString();
      adminName = dbAdmin.username;
    } else {
      isValid = normalizedUsername === adminUsername && String(password) === adminPassword;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = signAdminToken(adminId);
    res.json({ admin: { id: adminId, username: adminName }, token });
  } catch (e) {
    console.error('admin/login', e);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// POST /api/auth/admin/register
router.post('/admin/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedUsername = String(username).trim();
    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await Admin.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });
    if (existing) {
      return res.status(400).json({ error: 'Admin username or email already exists' });
    }

    const admin = await Admin.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: String(password),
    });

    const token = signAdminToken(admin._id.toString());
    res.status(201).json({
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
      },
      token,
    });
  } catch (e) {
    console.error('admin/register', e);
    res.status(500).json({ error: 'Admin signup failed' });
  }
});

// POST /api/auth/admin/reset-password — demo-style reset by email or username (DB-registered admins only; no email sent)
router.post('/admin/reset-password', async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    const raw = String(req.body.account || req.body.email || req.body.username || '').trim();
    if (!raw || !newPassword) {
      return res.status(400).json({ error: 'Email or username, and new password, are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const admin = await Admin.findOne({
      $or: [
        { email: raw.toLowerCase() },
        { username: new RegExp(`^${escaped}$`, 'i') },
      ],
    }).select('+password');
    if (admin) {
      admin.password = String(newPassword);
      await admin.save();
    }
    res.json({
      ok: true,
      message: 'If an admin account exists for that email or username, the password has been updated.',
    });
  } catch (e) {
    console.error('admin/reset-password', e);
    res.status(500).json({ error: 'Reset failed' });
  }
});

export default router;
