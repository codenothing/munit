#!/bin/bash
cd `dirname $0`
cd ../

# Clean out test results
if [ -d build/results/ ]; then
	rm -r build/results/
fi

# Clean out test generated files
if [ -d test/integration/results/nested/ ]; then
	rm -r test/integration/results/nested/
fi
