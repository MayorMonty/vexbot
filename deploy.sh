# Reset to origin branch
git reset --hard

echo "Downloading changes..."

# Update from GitHub
git pull;

# Download any new dependencies
npm install --no-scripts;

echo "Compiling..."
# Compile
tsc;

echo "Restarting..."
# Restart bot
pm2 restart vexbot;