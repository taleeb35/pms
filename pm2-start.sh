# #!/usr/bin/env bash
# set -e

# cd /home/zonoir/htdocs/zonoir.com

# # Load Node 22 (NVM)
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
# nvm use 22 >/dev/null 2>&1 || nvm install 22

# # Make sure deps exist (vite lives in devDependencies)
# unset NODE_ENV
# if [ -f package-lock.json ]; then
#   npm ci
# else
#   npm install
# fi

# npm run build

# export NODE_ENV=production
# export PORT=3035

# npm run preview

#!/usr/bin/env bash
# pm2-start.sh

# Go to project directory (where this file lives)
cd "$(dirname "$0")"

# Production environment
export NODE_ENV=production

# Port for the Vite preview server / app
export PORT=3035

# Start Vite preview for the built app
npm run preview -- --host 0.0.0.0 --port 3035