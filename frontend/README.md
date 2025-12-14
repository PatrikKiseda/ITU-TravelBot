# Travelbot Frontend

React frontend for the Travelbot travel planning application.

## Prerequisites

- **Node.js 20+** (check with `node --version`)
- **npm** (comes with Node.js)

## Install Dependencies

```bash
cd frontend
npm install
```

This reads `package.json` and downloads all required packages into `node_modules/`.

## Running Development Server

```bash
npm run dev
```

Starts Vite dev server at `http://localhost:5173` with hot module replacement (changes appear instantly).

**Note**: Make sure the backend is running on `http://localhost:8000` for API calls to work.

## Node.js Version Too Old

If you get `SyntaxError: Unexpected reserved word` or npm warnings about unsupported Node.js version:

**Fix** (WSL/Linux/Mac):
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load nvm
source ~/.nvm/nvm.sh

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
```
