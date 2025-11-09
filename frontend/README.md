# Travelbot Frontend

React frontend for the Travelbot travel planning application.

## Technologies

- **Node.js**: JavaScript runtime environment that executes JavaScript code outside the browser
- **npm**: Node Package Manager - manages project dependencies and scripts
- **Vite**: Fast build tool and development server that bundles your React code
- **React**: JavaScript library for building user interfaces with components
- **React Router**: Handles client-side routing between different pages/views

### How They Work Together

1. **Node.js** provides the runtime to run JavaScript tools
2. **npm** reads `package.json` and installs dependencies (React, Vite, etc.) into `node_modules/`
3. **Vite** serves your React app during development and bundles it for production
4. **React** renders your UI components in the browser
5. **React Router** manages navigation between pages without full page reloads

## Initialization

### Prerequisites

- **Node.js 20+** (check with `node --version`)
- **npm** (comes with Node.js)

### Install Dependencies

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

## Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` directory. These files can be served by any static file server.

## Common Issues & Fixes

### Node.js Version Too Old

**Error**: `SyntaxError: Unexpected reserved word` or npm warnings about unsupported Node.js version

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

**Fix** (Windows): Download and install Node.js 20+ from [nodejs.org](https://nodejs.org/)

### Port Already in Use

**Error**: Port 5173 is already in use

**Fix**: Vite will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual URL.

### npm Command Not Found

**Error**: `npm: command not found`

**Fix**: 
- Make sure Node.js is installed (npm comes with it)
- On WSL, you may need to restart your terminal after installing Node.js
- Verify with: `which node` and `which npm`

### Module Not Found After Installation

**Error**: `Cannot find module 'react'` or similar

**Fix**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Errors

**Error**: Frontend can't connect to backend

**Fix**:
1. Ensure backend is running: `cd be && PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Check `vite.config.js` has correct proxy configuration
3. Open browser console (F12) to see detailed error messages
4. Verify CORS is enabled in backend for `http://localhost:5173`

## Testing with Sample Data

Before testing the frontend, you'll need some sample offers in the database. Run these curl commands to create offers as a travel agent:

### 1. Create a Beach Destination (Bali)

```bash
curl -X POST http://localhost:8000/api/v1/agent/offers \
  -H "Content-Type: application/json" \
  -d '{"destination_name":"Bali","country":"Indonesia","city":"Ubud","origin":"Prague","destination_where_to":"Bali","capacity_available":10,"capacity_total":10,"date_from":"2025-06-01","date_to":"2025-06-08","season":"summer","type_of_stay":["beach","relax"],"price_housing":500,"price_food":200,"price_transport_mode":"plane","price_transport_amount":600,"short_description":"Beautiful tropical paradise with stunning beaches and rich culture","extended_description":"Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple.","image_url":"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"}'
```

### 2. Create a City Break (Paris)

```bash
curl -X POST http://localhost:8000/api/v1/agent/offers \
  -H "Content-Type: application/json" \
  -d '{"destination_name":"Paris","country":"France","city":"Paris","origin":"Prague","destination_where_to":"Paris","capacity_available":8,"capacity_total":8,"date_from":"2025-05-15","date_to":"2025-05-20","season":"spring","type_of_stay":["sightseeing","city"],"price_housing":400,"price_food":150,"price_transport_mode":"train_bus","price_transport_amount":250,"short_description":"The City of Light with world-famous museums and iconic landmarks","extended_description":"Paris, France'\''s capital, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.","image_url":"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"}'
```


### 3. Create an Adventure Destination (Iceland)

```bash
curl -X POST http://localhost:8000/api/v1/agent/offers \
  -H "Content-Type: application/json" \
  -d '{"destination_name":"Iceland","country":"Iceland","city":"Reykjavik","origin":"Prague","destination_where_to":"Iceland","capacity_available":6,"capacity_total":6,"date_from":"2025-07-10","date_to":"2025-07-17","season":"summer","type_of_stay":["outdoors","adventure"],"price_housing":600,"price_food":300,"price_transport_mode":"plane","price_transport_amount":450,"short_description":"Land of fire and ice with geysers, glaciers, and Northern Lights","extended_description":"Iceland is a Nordic island country in the North Atlantic Ocean. It is volcanically and geologically active. The interior consists of a plateau characterized by sand and lava fields, mountains and glaciers.","image_url":"https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800"}'
```

### Accept an Offer as a Customer

After creating offers, accept one to see it in the Plan view:

```bash
curl -X POST http://localhost:8000/api/v1/customer/offers/{offer_id}/accept \
  -H "Content-Type: application/json" \
  -d '{}'
```

Replace `{offer_id}` with the `id` from the response when you created the offer.

**Note**: 
- Make sure the backend is running before executing these commands
- The backend automatically creates a session ID cookie for you - no need to specify one
- For the frontend, make sure your browser uses the same session (cookies are automatically managed)
- If you accept an offer via curl and want to see it in the browser, you'll need to use the same session ID (check browser cookies)
