#!/usr/bin/env bash
set -e

cd /home/myclinichq/htdocs/myclinichq.com

# Load Node 22 (NVM)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null 2>&1 || nvm install 22

# Make sure deps exist (vite lives in devDependencies)
unset NODE_ENV
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build

export NODE_ENV=production
export PORT=3000

npm run preview