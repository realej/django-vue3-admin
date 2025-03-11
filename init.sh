#!/bin/bash
ENV_FILE=".env"
# examine .env Does the file exist?
if [ -f "$ENV_FILE" ]; then
    echo "$ENV_FILE The file already exists."
else
    # Generate MYSQL random password
    MYSQL_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 18)
    echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> "$ENV_FILE"
    echo "MYSQL random password has been generated and written $ENV_FILE file。"
    # Generate REDIS random password
    REDIS_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 12)
    # Write password to .env document
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> "$ENV_FILE"
    echo "REDIS random password has been generated and written $ENV_FILE document."
    
    awk 'BEGIN { cmd="cp -i ./backend/conf/env.example.py   ./backend/conf/env.py "; print "n" |cmd; }'
    sed -i "s|DATABASE_HOST = '127.0.0.1'|DATABASE_HOST = '177.10.0.13'|g" ./backend/conf/env.py
    sed -i "s|REDIS_HOST = '127.0.0.1'|REDIS_HOST = '177.10.0.15'|g" ./backend/conf/env.py
    sed -i "s|DATABASE_PASSWORD = 'DVADMIN3'|DATABASE_PASSWORD = '$MYSQL_PASSWORD'|g" ./backend/conf/env.py
    sed -i "s|REDIS_PASSWORD = 'DVADMIN3'|REDIS_PASSWORD = '$REDIS_PASSWORD'|g" ./backend/conf/env.py
    echo "Initialization password was created successfully"
fi

docker-compose up -d
docker exec dvadmin3-django python manage.py makemigrations
docker exec dvadmin3-django python manage.py migrate
docker exec dvadmin3-django python manage.py init
echo "Welcome to the DVDmin3 project"
echo "Login address: http://ip:8080"
echo "If you cannot access it, please check the firewall configuration"
