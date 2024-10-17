@echo off
setlocal EnableDelayedExpansion

set ENV_FILE=.env

:: Check if .env file exists and has all required variables
if exist %ENV_FILE% (
    set MISSING=0
    for %%v in (DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME DB_DIALECT NODE_ENV PORT SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASSWORD SESSION_SECRET) do (
        findstr /b "%%v=" %ENV_FILE% >nul
        if errorlevel 1 set MISSING=1
    )
    
    if !MISSING!==0 (
        echo .env file already exists with all required variables.
        exit /b 0
    )
)

echo Generating .env file...

:: Database Configuration
echo # Database Configuration > %ENV_FILE%
set /p "DB_HOST=DB_HOST [localhost]: "
if "!DB_HOST!"=="" set "DB_HOST=localhost"
echo DB_HOST=!DB_HOST!>> %ENV_FILE%

set /p "DB_PORT=DB_PORT [3306]: "
if "!DB_PORT!"=="" set "DB_PORT=3306"
echo DB_PORT=!DB_PORT!>> %ENV_FILE%

set /p "DB_USER=DB_USER [root]: "
if "!DB_USER!"=="" set "DB_USER=root"
echo DB_USER=!DB_USER!>> %ENV_FILE%

set /p "DB_PASSWORD=DB_PASSWORD: "
echo DB_PASSWORD=!DB_PASSWORD!>> %ENV_FILE%

set /p "DB_NAME=DB_NAME [database_development]: "
if "!DB_NAME!"=="" set "DB_NAME=database_development"
echo DB_NAME=!DB_NAME!>> %ENV_FILE%

set /p "DB_DIALECT=DB_DIALECT [mariadb]: "
if "!DB_DIALECT!"=="" set "DB_DIALECT=mariadb"
echo DB_DIALECT=!DB_DIALECT!>> %ENV_FILE%
echo.>> %ENV_FILE%

:: Application Configuration
echo # Application Configuration>> %ENV_FILE%
set /p "NODE_ENV=NODE_ENV [development]: "
if "!NODE_ENV!"=="" set "NODE_ENV=development"
echo NODE_ENV=!NODE_ENV!>> %ENV_FILE%

set /p "PORT=PORT [8080]: "
if "!PORT!"=="" set "PORT=8080"
echo PORT=!PORT!>> %ENV_FILE%
echo.>> %ENV_FILE%

:: Email Configuration
echo # Email Configuration>> %ENV_FILE%
set /p "SMTP_HOST=SMTP_HOST [smtp.example.com]: "
if "!SMTP_HOST!"=="" set "SMTP_HOST=smtp.example.com"
echo SMTP_HOST=!SMTP_HOST!>> %ENV_FILE%

set /p "SMTP_PORT=SMTP_PORT [587]: "
if "!SMTP_PORT!"=="" set "SMTP_PORT=587"
echo SMTP_PORT=!SMTP_PORT!>> %ENV_FILE%

set /p "SMTP_USER=SMTP_USER: "
echo SMTP_USER=!SMTP_USER!>> %ENV_FILE%

set /p "SMTP_PASSWORD=SMTP_PASSWORD: "
echo SMTP_PASSWORD=!SMTP_PASSWORD!>> %ENV_FILE%
echo.>> %ENV_FILE%

:: Session Configuration
echo # Session Configuration>> %ENV_FILE%
set "DEFAULT_SECRET=secret-%RANDOM%%RANDOM%"
set /p "SESSION_SECRET=SESSION_SECRET [%DEFAULT_SECRET%]: "
if "!SESSION_SECRET!"=="" set "SESSION_SECRET=%DEFAULT_SECRET%"
echo SESSION_SECRET=!SESSION_SECRET!>> %ENV_FILE%

echo Successfully created .env file!
endlocal