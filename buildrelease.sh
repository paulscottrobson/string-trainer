#
#		Build Music JSON directories and a release.zip which can be uploaded.
#
@echo off
cd compiler
python3 buildmusic.py
cd ..
cd app
zip -q -r ../release.zip .
mv ../release.zip /tmp
cd ..
