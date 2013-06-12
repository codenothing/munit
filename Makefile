.PHONY: all test clean


# No build steps or testing for now, just linting
all: test

lint:
	@node build/lint

clean:
	@./build/clean.sh

test: clean lint
	@node build/test.js

test-all:
	@NODE_TEST_NO_SKIP=1 make test

test-full: clean
	@./build/full.sh
