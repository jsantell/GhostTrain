BROWSERIFY=./node_modules/browserify/bin/cmd.js
UGLIFY=./node_modules/uglify-js/bin/uglifyjs

all: browserify min

browserify:
	mkdir -p ./dist
	node $(BROWSERIFY) -t brfs --standalone Mocker ./index.js > ./dist/mocker.js

min:
	node $(UGLIFY) ./dist/mocker.js -o ./dist/mocker.min.js

.PHONY: browserify min
