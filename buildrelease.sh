
cd compiler
python buildmusic.py
cd ..
rm release.zip
zip -r release.zip app
#zip -d release.zip .git/*