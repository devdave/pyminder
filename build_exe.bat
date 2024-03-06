cd ui
pnpm build
cd ..
pyinstaller --paths=pyminder\lib --paths=pyminder --add-data ui\dist:ui\dist  -F pyminder\main.py
