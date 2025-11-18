#!/bin/bash

# E-commerce Backend Interview Setup Script

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   E-commerce Backend - Interview Setup                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init
echo "✓ Migrations complete"
echo ""

# Seed database
echo "🌱 Seeding database with test data..."
npm run seed
echo "✓ Database seeded"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Start the server: npm run dev"
echo "  2. Open another terminal and test: curl http://localhost:3000/health"
echo "  3. Check README.md for exercise details"
echo ""
echo "Useful commands:"
echo "  npm run dev              - Start development server"
echo "  npm run prisma:studio    - Open database GUI"
echo "  npm run seed             - Re-seed database"
echo ""
echo "Happy interviewing! 🚀"


