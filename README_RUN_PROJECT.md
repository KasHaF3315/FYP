# How to Run This Project

## ⚠️ IMPORTANT: Install Node.js First

The error `'npm' is not recognized` means **Node.js is not installed** on your system.

### Quick Fix:

1. **Download and Install Node.js:**
   - Go to: **https://nodejs.org/**
   - Download the **LTS version** (recommended)
   - Run the installer and follow the steps
   - **Restart your computer** after installation

2. **Verify Installation:**
   Open a new terminal and type:
   ```
   node --version
   npm --version
   ```
   You should see version numbers.

3. **Run the Project:**

   **Option A: Use the batch files**
   - Double-click `start-backend.bat` (opens in one window)
   - Double-click `start-frontend.bat` (opens in another window)

   **Option B: Use terminal commands**
   
   Open **Terminal 1**:
   ```powershell
   cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
   npm run dev
   ```
   
   Open **Terminal 2**:
   ```powershell
   cd c:\Users\areeb\Desktop\Fyp\Fyp\frontend
   npm run dev
   ```

## ✅ MongoDB Connection

The MongoDB connection has been configured in `backend/.env`:
- Connection: `mongodb+srv://bashirkashaf123:Kashaf@qm.jo9zpcz.mongodb.net/?appName=qm`

The backend will automatically connect to MongoDB when it starts.

## Expected Output

- **Backend:** Running on `http://localhost:5000`
- **Frontend:** Running on `http://localhost:5173` (or similar port)

You should see:
- Backend: `Backend running at http://localhost:5000` and `MongoDB connected`
- Frontend: `Local: http://localhost:5173`
