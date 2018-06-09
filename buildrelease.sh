
cd compiler
python buildmusic.py
cd ..
rm release.zip
cd app
zip -r ../release.zip .
cd ..