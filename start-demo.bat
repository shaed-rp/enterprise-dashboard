@echo off
echo ========================================
echo   DealerX Enterprise Dashboard Demo
echo ========================================
echo.
echo Starting the demo frontend...
echo.

REM Check if we're in the right directory
if not exist "dealerbuilt-dashboard\package.json" (
    echo ERROR: Please run this script from the root directory of the project.
    echo Current directory: %CD%
    echo Expected to find: dealerbuilt-dashboard\package.json
    pause
    exit /b 1
)

REM Navigate to frontend directory and start dev server
cd dealerbuilt-dashboard
echo Starting development server...
echo.
echo The demo will be available at: http://localhost:5173/
echo.
echo Demo Login Credentials:
echo - Executive: executive@dealership.com / StrongPassword123!
echo - Service Manager: service.manager@dealership.com / StrongPassword123!
echo - Sales Manager: sales.manager@dealership.com / StrongPassword123!
echo - Staff: staff@dealership.com / StrongPassword123!
echo.
echo Press Ctrl+C to stop the server
echo.
pnpm dev
