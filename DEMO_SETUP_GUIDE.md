# 🚀 DealerX Enterprise Dashboard - Demo Setup Guide

This guide provides multiple ways to start the DealerX Enterprise Dashboard demo, avoiding the common directory confusion issue.

## 🎯 Quick Start Options

### Option 1: Root Directory Commands (Recommended)
```bash
# From the root directory (dealerbuilt-enterprise-dashboard)
pnpm dev                    # Starts frontend demo
pnpm dev:frontend          # Same as above
pnpm dev:full              # Starts both frontend and backend
```

### Option 2: Convenience Scripts
```bash
# Windows Batch File
./start-demo-simple.bat    # Simple batch file
./start-demo.bat           # Full-featured batch file

# PowerShell Script
./start-demo.ps1           # PowerShell with error checking
```

### Option 3: Manual Navigation
```bash
# Navigate to frontend directory first
cd dealerbuilt-dashboard
pnpm dev
```

## 🔧 What We've Fixed

### Before (Problem)
```bash
# ❌ This would fail from root directory
pnpm dev
# Error: ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND
```

### After (Solution)
```bash
# ✅ Now works from root directory
pnpm dev
# Success: Server starts on http://localhost:5173/
```

## 📁 Project Structure
```
dealerbuilt-enterprise-dashboard/
├── package.json              # ← NEW: Root package.json
├── pnpm-workspace.yaml       # ← NEW: Workspace config
├── start-demo.ps1           # ← NEW: PowerShell script
├── start-demo.bat           # ← NEW: Batch file
├── start-demo-simple.bat    # ← NEW: Simple batch file
├── dealerbuilt-dashboard/   # Frontend React app
│   ├── package.json
│   ├── src/
│   └── ...
└── dealerbuilt-api-service/ # Backend Python API
    ├── main.py
    └── ...
```

## 🎮 Demo Access

Once started, access the demo at:
- **URL**: http://localhost:5173/
- **Demo Credentials**:
  - **Executive**: `executive@dealership.com` / `StrongPassword123!`
  - **Service Manager**: `service.manager@dealership.com` / `StrongPassword123!`
  - **Sales Manager**: `sales.manager@dealership.com` / `StrongPassword123!`
  - **Staff**: `staff@dealership.com` / `StrongPassword123!`

## 🛠️ Available Commands

### From Root Directory
```bash
pnpm dev              # Start frontend demo
pnpm dev:frontend     # Start frontend demo
pnpm dev:backend      # Start backend API
pnpm dev:full         # Start both frontend and backend
pnpm build            # Build frontend for production
pnpm test             # Run frontend tests
pnpm lint             # Lint frontend code
pnpm install:all      # Install all dependencies
```

### From Frontend Directory
```bash
cd dealerbuilt-dashboard
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm lint             # Lint code
```

## 🔍 Troubleshooting

### Issue: "No package.json found"
**Solution**: Make sure you're in the root directory (`dealerbuilt-enterprise-dashboard`) and run `pnpm dev`

### Issue: "pnpm not found"
**Solution**: Install pnpm globally:
```bash
npm install -g pnpm
```

### Issue: Port 5173 already in use
**Solution**: Kill the existing process or use a different port:
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: PowerShell execution policy
**Solution**: Allow script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎯 Best Practices

1. **Always start from root directory**: Use `pnpm dev` from the root
2. **Use convenience scripts**: `start-demo-simple.bat` is the most reliable
3. **Check the README**: Updated with new instructions
4. **Keep terminal open**: The dev server needs to keep running

## 🚀 Production Deployment

For production deployment, use the Docker setup:
```bash
./deploy.sh deploy
```

This will build and deploy both frontend and backend with proper configuration.

## 📝 Summary

The directory confusion issue has been resolved by:
1. ✅ Adding a root-level `package.json` with workspace configuration
2. ✅ Creating convenience scripts for easy startup
3. ✅ Updating documentation with clear instructions
4. ✅ Providing multiple startup options for different preferences

Now you can start the demo from anywhere in the project structure! 🎉
