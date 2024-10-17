#!/bin/bash

ENV_FILE=".env"

# Check if .env file exists
if [ -f "$ENV_FILE" ]; then
    # Check if all required variables are present
    MISSING=0
    REQUIRED_VARS=(
        "DB_HOST" "DB_PORT" "DB_USER" "DB_PASSWORD" "DB_NAME" "DB_DIALECT"
        "NODE_ENV" "PORT"
        "SMTP_HOST" "SMTP_PORT" "SMTP_USER" "SMTP_PASSWORD"
        "SESSION_SECRET"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            MISSING=1
            break
        fi
    done
    
    if [ $MISSING -eq 0 ]; then
        echo ".env file already exists with all required variables."
        exit 0
    fi
fi

echo "Generating .env file..."

# Database Configuration
echo "# Database Configuration" > $ENV_FILE
read -p "DB_HOST [localhost]: " DB_HOST
echo "DB_HOST=${DB_HOST:-localhost}" >> $ENV_FILE

read -p "DB_PORT [3306]: " DB_PORT
echo "DB_PORT=${DB_PORT:-3306}" >> $ENV_FILE

read -p "DB_USER [root]: " DB_USER
echo "DB_USER=${DB_USER:-root}" >> $ENV_FILE

read -p "DB_PASSWORD: " DB_PASSWORD
echo "DB_PASSWORD=${DB_PASSWORD:-}" >> $ENV_FILE

read -p "DB_NAME [database_development]: " DB_NAME
echo "DB_NAME=${DB_NAME:-database_development}" >> $ENV_FILE

read -p "DB_DIALECT [mariadb]: " DB_DIALECT
echo "DB_DIALECT=${DB_DIALECT:-mariadb}" >> $ENV_FILE
echo "" >> $ENV_FILE

# Application Configuration
echo "# Application Configuration" >> $ENV_FILE
read -p "NODE_ENV [development]: " NODE_ENV
echo "NODE_ENV=${NODE_ENV:-development}" >> $ENV_FILE

read -p "PORT [8080]: " PORT
echo "PORT=${PORT:-8080}" >> $ENV_FILE
echo "" >> $ENV_FILE

# Email Configuration
echo "# Email Configuration" >> $ENV_FILE
read -p "SMTP_HOST [smtp.example.com]: " SMTP_HOST
echo "SMTP_HOST=${SMTP_HOST:-smtp.example.com}" >> $ENV_FILE

read -p "SMTP_PORT [587]: " SMTP_PORT
echo "SMTP_PORT=${SMTP_PORT:-587}" >> $ENV_FILE

read -p "SMTP_USER: " SMTP_USER
echo "SMTP_USER=${SMTP_USER:-}" >> $ENV_FILE

read -p "SMTP_PASSWORD: " SMTP_PASSWORD
echo "SMTP_PASSWORD=${SMTP_PASSWORD:-}" >> $ENV_FILE
echo "" >> $ENV_FILE

# Session Configuration
echo "# Session Configuration" >> $ENV_FILE
DEFAULT_SECRET="secret-$(date +%s%N | md5sum | head -c 20)"
read -p "SESSION_SECRET [$DEFAULT_SECRET]: " SESSION_SECRET
echo "SESSION_SECRET=${SESSION_SECRET:-$DEFAULT_SECRET}" >> $ENV_FILE

echo "Successfully created .env file!"