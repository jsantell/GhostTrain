BROWSERIFY=./node_modules/browserify/bin/cmd.js
UGLIFY=./node_modules/uglify-js/bin/uglifyjs

all: browserify min

browserify:
	mkdir -p ./dist
	node $(BROWSERIFY) --standalone GhostTrain ./index.js > ./dist/ghosttrain.js
	
	# Create legacy build with polyfills
	cp ./legacy/polyfills.js ./dist/ghosttrain-legacy.js
	cat ./legacy/json2.js >> ./dist/ghosttrain-legacy.js
	cat ./dist/ghosttrain.js >> ./dist/ghosttrain-legacy.js
	
	# Create test bundle
	mkdir -p ./build
	node $(BROWSERIFY) ./test/test.*.js > ./build/test-bundle.js

min:
	node $(UGLIFY) ./dist/ghosttrain.js -o ./dist/ghosttrain.min.js
	node $(UGLIFY) ./dist/ghosttrain-legacy.js -o ./dist/ghosttrain-legacy.min.js

.PHONY: browserify min
