#######################################################################
#   Jogo da Memoria Builder
#   Copyright (C) 2014, Gustavo Carvalho
#
#   Jogo da Memoria é licenciado sobre a MIT License.
#   http://www.opensource.org/licenses/mit-license.php
#
#   javascript compilation / "minification" makefile
#
#   BUILD_MODULES -- js files to minify
#   BUILD  -- js minified target file
#
#######################################################################

# GOOGLE CLOSURE COMPILER
GCC_VERSION = 2338
GCC_PATH = tools/closure-compiler/
GCC_COMPRESSOR = ${GCC_PATH}compiler$(GCC_VERSION).jar
GCC_OPTION =
# GCC_OPTION = --compilation_level ADVANCED_OPTIMIZATIONS

# Set the source directory
srcdir = src
buildir = game/assets/js

# CURRENT BUILD VERSION
#GAME_VERSION=$(shell cat $(srcdir)/version | sed "s/^.*[^0-9]\([0-9]*\.[0-9]*\.[0-9]*\).*/\1/")
GAME_VERSION= 0.1.3
VERSION=sed "s/@VERSION/${GAME_VERSION}/"

# list of external libraries
LIBRARIES = $(srcdir)/lib/alertify.js\
	 $(srcdir)/lib/ImageManager.js

# list of modules
MODULES = $(srcdir)/core.js\
	 $(srcdir)/modules/system.js\
	 $(srcdir)/modules/event.js\
	 $(srcdir)/modules/utils.js\
	 $(srcdir)/classes/Card.js\
	 $(srcdir)/classes/Board.js

# list of modules to compile into minified file
BUILD_MODULES = $(LIBRARIES)\
	 $(MODULES)

# Debug Target name
DEBUG = $(buildir)/memory-$(GAME_VERSION).js

# Build Target name
BUILD = $(buildir)/memory-$(GAME_VERSION)-min.js

#######################################################################

.DEFAULT_GOAL := build

.PHONY: js

all: build

build: debug
	java -jar $(GCC_COMPRESSOR) $(GCC_OPTION) --js=$(DEBUG) --js_output_file=$(BUILD)

debug: clean
	cat $(BUILD_MODULES) | $(VERSION) >> $(DEBUG)

clean:
	rm -Rf $(buildir)/*

#######################################################################
