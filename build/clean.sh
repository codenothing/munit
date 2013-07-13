#!/bin/bash
cd `dirname $0`
cd ../

# Cleans out test results
if [ -d build/results/ ]; then
	rm -r build/results/
fi

# Cleans out test mkdir
if [ -d test/render/_mkdir/ ]; then
	rm -r test/render/_mkdir/
fi

# Cleans out test _renderPath
if [ -d test/render/_renderPath/ ]; then
	rm -r test/render/_renderPath/
fi
