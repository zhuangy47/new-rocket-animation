# new-rocket-animation

To build:
1. Go to ./new-rocket-animation/
2. Run npm install
3. Run browserify src/main.js -o src/index.js

Note: Make all js changes in main.js; browserify is for bundling for deployment

To deploy:
1. Go to ./new-rocket-animation/
2. Run browserify src/main.js -o src/index.js
3. Run npm start
4. Navigate to the localhost site that shows up

Do NOT use live preview - it will complain that "require()" is not defined.

Changes will be live, but for any changes you make to main.js, you must rebundle with browserify, or else the changes won't be reflected.
