#!/bin/bash
# build.sh — Run this to build the full app for production
set -e

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo "📦 Installing client dependencies..."
cd client && npm install

echo "🏗️  Building React app..."
npm run build
cd ..

echo "✅ Build complete. Start with: cd server && node index.js"
