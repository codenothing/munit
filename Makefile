.PHONY: all test clean


all: test

clean:
	@./build/clean.sh

lint:
	@node build/lint.js

test: clean lint
	@node build/test.js

test-all:
	@NODE_TEST_NO_SKIP=1 make test

test-full: clean
	@./build/full.sh
