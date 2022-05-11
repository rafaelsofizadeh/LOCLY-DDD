# https://stackoverflow.com/a/40178818/6539857
STATUS="$(git status)"

if [[ $STATUS == *"nothing to commit, working tree clean"* ]]
then
    npm run build
    sed -i "" '/dist/d' ./.gitignore
    sed -i "" '/secrets.ts/d' ./.gitignore
    cp Procfile dist/Procfile
    cp package.deployment.json dist/package.json
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    git add .
    git commit -m "Edit .gitignore to publish"
    # https://stackoverflow.com/a/65733058/6539857
    git push heroku `git subtree split --prefix dist ${BRANCH}`:master --force
    git reset HEAD~
    git checkout .gitignore
    rm -r dist
else
    echo "Need clean working directory to publish"
fi