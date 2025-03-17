# gunicorn.conf
# coding:utf-8
# Startup command: gunicorn -c gunicorn.py application.asgi:application
import multiprocessing
# Number of parallel worker processes, int, recommended process count is cpu count * 2 + 1
workers = multiprocessing.cpu_count() * 2 + 1
# Specify the number of threads opened by each process
threads = 3
# Bound IP and port
bind = '0.0.0.0:8000'
# Set daemon process, let third-party manage the process
daemon = 'false'
# Worker mode coroutine, the default is sync mode, it is recommended to use gevent, here use with uvicorn uvicorn.workers.UvicornWorker
worker_class = 'uvicorn.workers.UvicornWorker'
# Set the maximum concurrency (number of working threads that each worker processes requests, positive integer, default is 1)
worker_connections = 10000
# Maximum client concurrency, by default this value is 1000. This setting will affect gevent and eventlet worker modes
# Each worker process will automatically restart the process after processing max_requests requests
max_requests = 10000
max_requests_jitter = 200
# Set process file directory
pidfile = './gunicorn.pid'
# Log level, this log level refers to the error log level, and the access log level cannot be set
loglevel = 'info'
# Set gunicorn access log format, error log cannot be set
access_log_format = '' # When worker_class is uvicorn.workers.UvicornWorker, the log format is Django's loggers
# Listen queue
backlog = 512
# process name
proc_name = 'gunicorn_process'
# Set timeout 120s, default is 30s. Set according to your needs
timeout = 120
# Timeout restart
graceful_timeout = 300
# Number of seconds to wait for requests on keep-alive connections, by default the value is 2. Generally set between 1~5 seconds.
keepalive = 3
# Maximum size of HTTP request line, this parameter is used to limit the allowed size of HTTP request line, by default this value is 4094.
# The value is a number from 0 to 8190. This parameter can prevent any DDOS attack
limit_request_line = 5120
# Limit the number of request header fields in an HTTP request.
# This field is used to limit the number of request header fields to prevent DDOS attacks, and can be used with limit-request-field-size to improve security.
# By default, this value is 100, this value cannot exceed 32768
limit_request_fields = 101
# Limit the size of request headers in an HTTP request, by default this value is 8190.
# The value is an integer or 0, when this value is 0, it means that the request header size will not be limited
limit_request_field_size = 0
# Record to standard output
accesslog = '-'