#
#		Build Music JSON directories and a release.zip which can be uploaded.
#
cd compiler
python buildmusic.py
cd ..
rm release.zip
cd app
zip -q -r ../release.zip .
cd ..