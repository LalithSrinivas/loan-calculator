#!/bin/bash

# Remove existing build and out directories
rm -rf .next out

# Clean install dependencies
rm -rf node_modules
npm install

# Run deployment
npm run deploy 