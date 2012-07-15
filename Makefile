.PHONY: all test clean


# No build steps or testing for now, just linting
all: lint

lint:
	@node build/lint
