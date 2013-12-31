BROWSERIFY=./node_modules/browserify/bin/cmd.js
UGLIFY=./node_modules/uglify-js/bin/uglifyjs

all: browserify min

browserify:
	mkdir -p ./dist
	node $(BROWSERIFY) --standalone GhostTrain ./index.js > ./dist/ghosttrain.js

min:
	node $(UGLIFY) ./dist/ghosttrain.js -o ./dist/ghosttrain.min.js

.PHONY: browserify min
