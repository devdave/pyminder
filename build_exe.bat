cd ui
pnpm build
cd ..
pyinstaller --paths=pyminder\lib ^
--name pyminder.exe ^
--clean ^
--paths=pyminder ^
--add-data ui\dist:ui\dist  ^
-F pyminder\main.py
