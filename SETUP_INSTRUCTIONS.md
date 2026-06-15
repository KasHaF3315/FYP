# Project Setup Instructions

## ✅ MongoDB Connection Updated
The MongoDB connection string has been updated in `backend/.env`:
```
MONGODB_URI=mongodb+srv://bashirkashaf123:Kashaf@qm.jo9zpcz.mongodb.net/?appName=qm
```

## ⚠️ Node.js Installation Required

The error `'npm' is not recognized` means Node.js is not installed or not in your PATH.

### Step 1: Install Node.js

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the Windows Installer (.msi) - 64-bit recommended

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - **Important:** Make sure "Add to PATH" is checked (it should be by default)
   - Complete the installation

3. **Restart Your Terminal/IDE:**
   - Close all terminal windows
   - Close and reopen Cursor/VS Code
   - This ensures the PATH environment variable is updated

4. **Verify Installation:**
   Open a new terminal and run:
   ```powershell
   node --version
   npm --version
   ```
   Both should show version numbers.

### Step 2: Run the Project

Once Node.js is installed, open **two separate terminal windows**:

**Terminal 1 - Backend:**
```powershell
cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\areeb\Desktop\Fyp\Fyp\frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend will run on `http://localhost:5173` (or similar).

## Troubleshooting

If `npm` is still not recognized after installation:
1. Restart your computer
2. Check if Node.js is in PATH: Open System Properties → Environment Variables → Check PATH contains `C:\Program Files\nodejs\`
3. Try using the full path: `"C:\Program Files\nodejs\npm.cmd" run dev`
