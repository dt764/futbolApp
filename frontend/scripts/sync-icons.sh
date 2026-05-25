#!/bin/bash
# Copia los iconos generados al proyecto Android
# Ejecutar después de: npx cap add android

ANDROID_RES="android/app/src/main/res"

cp -r resources/android/mipmap-mdpi/*    "$ANDROID_RES/mipmap-mdpi/"
cp -r resources/android/mipmap-hdpi/*    "$ANDROID_RES/mipmap-hdpi/"
cp -r resources/android/mipmap-xhdpi/*   "$ANDROID_RES/mipmap-xhdpi/"
cp -r resources/android/mipmap-xxhdpi/*  "$ANDROID_RES/mipmap-xxhdpi/"
cp -r resources/android/mipmap-xxxhdpi/* "$ANDROID_RES/mipmap-xxxhdpi/"
cp -r resources/android/mipmap-anydpi-v26/* "$ANDROID_RES/mipmap-anydpi-v26/"
cp -r resources/android/drawable/*       "$ANDROID_RES/drawable/"

echo "✓ Iconos copiados a $ANDROID_RES"
