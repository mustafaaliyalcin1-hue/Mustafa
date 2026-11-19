#!/usr/bin/env bash
# Tepetaklak Stüdyo APK'sını derler (Gradle'sız; Ubuntu android-sdk paketleri: platform-23, aapt, dx, zipalign, apksigner).
#   bash studio/mobil/derle.sh        → studio/mobil/cikti/TepetaklakStudyo.apk
set -euo pipefail
cd "$(dirname "$0")"
M=$(pwd); A=$M/android; B=$M/build; OUT=$M/cikti
JAR=/usr/lib/android-sdk/platforms/android-23/android.jar
if ! [ -f "$JAR" ] || ! command -v aapt >/dev/null || ! command -v apksigner >/dev/null; then
  apt-get install -y -qq android-sdk-platform-23 aapt zipalign apksigner dalvik-exchange >/dev/null
fi
bash varliklar.sh
rm -rf "$B"; mkdir -p "$B/gen" "$B/obj" "$B/assets" "$OUT"
cp -r web "$B/assets/web"

echo "1/6 kaynaklar (R.java)"
aapt package -f -m -J "$B/gen" -M "$A/AndroidManifest.xml" -S "$A/res" -I "$JAR"
echo "2/6 Java derleme"
javac -nowarn -source 8 -target 8 -bootclasspath "$JAR" -classpath "$JAR" -d "$B/obj" \
  $(find "$A/src" "$B/gen" -name "*.java") 2> "$B/javac.log" || { grep -v JAVA_TOOL_OPTIONS "$B/javac.log"; exit 1; }
echo "3/6 dex"
dalvik-exchange --dex --min-sdk-version=24 --output="$B/classes.dex" "$B/obj"
echo "4/6 paketleme"
aapt package -f -M "$A/AndroidManifest.xml" -S "$A/res" -A "$B/assets" -I "$JAR" -F "$B/imzasiz.apk" \
  --min-sdk-version 24 --target-sdk-version 34
(cd "$B" && aapt add imzasiz.apk classes.dex >/dev/null)
echo "5/6 hizalama"
zipalign -f -p 4 "$B/imzasiz.apk" "$B/hizali.apk"
echo "6/6 imzalama"
KS=$M/imza/tepetaklak.jks
if [ ! -f "$KS" ]; then
  mkdir -p "$M/imza"
  keytool -genkeypair -keystore "$KS" -storepass tepetaklak -keypass tepetaklak -alias studyo -keyalg RSA -keysize 2048 \
    -validity 10000 -dname "CN=Tepetaklak Studyo, O=Tepetaklak, C=TR" 2>&1 | grep -v JAVA_TOOL_OPTIONS || true
fi
apksigner sign --ks "$KS" --ks-pass pass:tepetaklak --key-pass pass:tepetaklak --ks-key-alias studyo \
  --min-sdk-version 24 --out "$OUT/TepetaklakStudyo.apk" "$B/hizali.apk"
apksigner verify --min-sdk-version 24 "$OUT/TepetaklakStudyo.apk" && echo "imza doğrulandı"
ls -la "$OUT/TepetaklakStudyo.apk"
