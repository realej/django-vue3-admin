import os

from application.settings import BASE_DIR

# ===================================================================== #
# ***************mysql database configuration ******************#
# ===================================================================== #
# Database ENGINE, the default demonstration uses sqlite3 database, and it is recommended to use mysql database in the formal environment
# sqlite3 settings
# DATABASE_ENGINE = "django.db.backends.sqlite3"
# DATABASE_NAME = os.path.join(BASE_DIR, "db.sqlite3")

# When using mysql, change to this configuration
DATABASE_ENGINE = "django.db.backends.mysql"
DATABASE_NAME = 'django-vue3-admin' # mysql When using

# Database address Change to your own database address
DATABASE_HOST = '127.0.0.1'
# # Database Port
DATABASE_PORT = 3306
# # Database username
DATABASE_USER = "root"
# # Database Password
DATABASE_PASSWORD = 'DVADMIN3'

# Table prefix
TABLE_PREFIX = "dvadmin_"
# ===================================================================== #
# **********redis configuration, no redis can be configured ************#
# ===================================================================== #
REDIS_DB = 1
CELERY_BROKER_DB = 3
REDIS_PASSWORD = 'DVADMIN3'
REDIS_HOST = '127.0.0.1'
REDIS_URL = f'redis://:{REDIS_PASSWORD or ""}@{REDIS_HOST}:6379'
# ===================================================================== #
#******************Function Start and Stop *********************#
# ===================================================================== #
DEBUG = True
# Start login to obtain detailed overview (get the IP address by calling the API. If it is an intranet, just close it)
ENABLE_LOGIN_ANALYSIS_LOG = True
# Login interface /api/token/Whether verification code authentication is required, for testing, formal environment recommendation is cancelled
LOGIN_NO_CAPTCHA_AUTH = True
# ===================================================================== #
# ******************Other Configuration *********************#
# ===================================================================== #

ALLOWED_HOSTS = ["*"]
# Exclude App Applications from Column Permissions
COLUMN_EXCLUDE_APPS = []
