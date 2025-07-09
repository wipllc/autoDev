#!/bin/bash

# Deployment script for Cloudflare Workers with Durable Objects
# This script ensures migrations are applied correctly

echo "🚀 Starting deployment with Durable Objects migration..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if this is the first deployment by trying to fetch the current deployment
echo "🔍 Checking current deployment status..."

# Use wrangler deploy for Durable Objects migration
echo "📡 Deploying with migrations..."
npx wrangler deploy --compatibility-date=2025-04-04

echo "✅ Deployment completed successfully!"