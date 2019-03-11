#
#	Script to rebuild and update sound, graphics and fonts in application.
#

echo "Making instrument code"
cd compiler
python3 instruments.py
cd ..

echo "Making Graphics"
cd resources/graphics
python3 makeatlas.py
python3 makecurves.py
python3 makeframes.py

echo "cping to assets"
cp sprites.* ../../app/assets/sprites 
cp loader.png ../../app/assets/sprites 
cd ..
cp fonts/*.png ../app/assets/fonts  
cp fonts/*.fnt ../app/assets/fonts 

echo "Updating .ogg files"
rm ../app/assets/sounds/*.ogg ../app/assets/sounds/*.mp3 
cp notes/sounds/*.ogg  ../app/assets/sounds 

echo "Converting OGG to MP3"
cd ../app/assets/sounds
for f in *.ogg; do 
	ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; 
done
cd ../../..
echo "Done."
