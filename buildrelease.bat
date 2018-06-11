rem
rem		Build Music JSON directories and a release.zip which can be uploaded.
rem
@echo off
cd compiler
python buildmusic.py
cd ..
del /Q release.zip
cd app
zip -q -r ..\release.zip .
cd ..