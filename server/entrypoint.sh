#!/bin/sh
set -e

echo "===> [InsurMatch] Applying Prisma Database Schema..."
npx prisma db push --accept-data-loss

echo "===> [InsurMatch] Seeding 10 real customer records..."
node prisma/seed.js

echo "===> [InsurMatch] Launching Express API Server..."
exec node src/index.js
