# docker Mirror packing

### PackwebBaseBuildBag

~~~sh
# Compile and package locally
docker build -f ./docker_env/web/DockerfileBuild -t registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-web:16.19-alpine .
# Upload to Alibaba Cloud Repository
docker push registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-web:16.19-alpine

~~~

### PackBackendBaseBuildBag

~~~sh
# Compile and package locally
docker build -f ./docker_env/django/DockerfileBuild -t registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-backend:latest .
# Upload to Alibaba Cloud Repository
docker push registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-backend:latest
~~~

### Run the front end

~~~
docker build -f ./docker_env/web/Dockerfile -t dvadmin-pro-web .
~~~

### Run the backend

~~~
docker build -f ./docker_env/django/Dockerfile -t dvadmin-pro-django .
~~~

### runcelery

~~~
docker build -f ./docker_env/celery/Dockerfile -t dvadmin-pro-celery .
~~~

## docker-compose run

~~~
# Install firstdocker-compose (Install on Baidu),Execute this command to wait for installation，If usedceleryPlease open the plugindocker-compose.ymlmiddlecelery Partial comments
docker-compose up -d
# Initialize backend data(Just execute it for the first time)
docker exec -ti dvadmin-django bash
python manage.py makemigrations 
python manage.py migrate
python manage.py init -y
exit

Front-end address：http://127.0.0.1:8080
Backend address：http://127.0.0.1:8000
# Please put it on the server127.0.0.1 Change it to your own public networkip
account：superadmin password：admin123456

# docker-compose stop
docker-compose down
#  docker-compose Restart
docker-compose restart
#  docker-compose Restart on startup build
docker-compose up -d --build

~~~

