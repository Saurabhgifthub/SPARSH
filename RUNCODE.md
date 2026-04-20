cd "C:\Users\SAURABH PRAJAPATI\OneDrive\Desktop\S.P.A.R.S.H-main (2)\S.P.A.R.S.H-main\frontend"

# Kill old processes again (just in case)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Start the project
npm run dev
