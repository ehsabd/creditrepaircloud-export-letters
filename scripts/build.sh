#!/bin/bash

. .env

build() {
    echo "EXPORT_BUTTON_TEXT is ${EXPORT_BUTTON_TEXT}"
    echo "SUCCESS_MESSAGE is ${SUCCESS_MESSAGE}"
    echo 'building react'

    rm -rf dist/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    react-scripts build

    mkdir -p dist
    cp -r build/* dist

    mv dist/index.html dist/popup.html

    sed "s|<EXPORT_BUTTON_TEXT>|${EXPORT_BUTTON_TEXT:-'Export Letters'}|" -i dist/crc-export-letters.js
    sed "s|<SUCCESS_MESSAGE>|${SUCCESS_MESSAGE:-'Letters Have Been Exported Successfully'}|" -i dist/crc-export-letters.js
    
    }

build