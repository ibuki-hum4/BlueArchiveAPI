#!/bin/sh
set -eu

REPO_DIR=/tmp/repo
KEY_DIR=/etc/git-deploy-key
REPO_BRANCH="${REPO_BRANCH:-main}"

mkdir -p ~/.ssh
chmod 700 ~/.ssh
cp "$KEY_DIR/ssh-privatekey" ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519
ssh-keyscan -t ed25519,rsa github.com >> ~/.ssh/known_hosts 2>/dev/null

git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"

/app/export_students -database-url "$DATABASE_URL" -out data/students.json

if git diff --quiet -- data/students.json; then
    echo "data/students.json is already up to date"
    exit 0
fi

git config user.name "bluearchive-bot"
git config user.email "bluearchive-bot@users.noreply.github.com"
git add data/students.json
git commit -m "chore: weekly students.json backup from database"
git push origin "HEAD:$REPO_BRANCH"
