@echo off
echo Compilando o Backend Java do Abrigo Animal Joinville...
set JAVA=C:\Users\marcu\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64\bin

if not exist out mkdir out

"%JAVA%\javac.exe" --add-modules jdk.httpserver -d out ^
  src\main\java\br\com\abrigojoinville\modelo\Animal.java ^
  src\main\java\br\com\abrigojoinville\modelo\Destaque.java ^
  src\main\java\br\com\abrigojoinville\servico\ServicoAnimal.java ^
  src\main\java\br\com\abrigojoinville\controlador\ControladorApi.java ^
  src\main\java\br\com\abrigojoinville\App.java

if %errorlevel% neq 0 (
  echo ERRO na compilacao Java!
  pause
  exit /b 1
)

echo Compilacao OK! Iniciando o servidor em http://localhost:8765
"%JAVA%\java.exe" --add-modules jdk.httpserver -cp out br.com.abrigojoinville.App
