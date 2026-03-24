## 讲解

在 **Laravel 项目里使用 Docker + docker-compose 自动构建环境** 时，目录结构和分层设计非常重要，不然容易混乱。

常见做法是 **应用代码和容器配置分开**，这样清晰可维护。下面给你一个推荐的目录结构和说明：

## 📂 推荐目录结构

```csharp
laravel-project/          # Laravel 项目根目录
├── src/                  # 存放 Laravel 应用代码（composer create-project 生成的代码放这里）
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   ├── artisan
│   └── composer.json
│
├── docker/               # 专门存放 Docker 配置
│   ├── php/              # PHP-FPM 容器
│   │   ├── Dockerfile
│   │   └── php.ini
│   ├── nginx/            # Nginx 容器
│   │   ├── default.conf  # 虚拟主机配置
│   └── mysql/            # MySQL 容器（可选 init.sql 脚本）
│       └── init.sql
│
├── docker-compose.yml    # docker-compose 配置文件
└── .env                  # Laravel 项目的环境变量（跟 docker-compose 交互）

```

## 📑 docker-compose.yml 示例

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./docker/php
    container_name: laravel_app
    volumes:
      - ./src:/var/www/html
    networks:
      - laravel
    depends_on:
      - db

  nginx:
    image: nginx:alpine
    container_name: laravel_nginx
    ports:
      - "8080:80"
    volumes:
      - ./src:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - laravel
    depends_on:
      - app

  db:
    image: mysql:8.0
    container_name: laravel_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: laravel
      MYSQL_USER: laravel
      MYSQL_PASSWORD: secret
    volumes:
      - db_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - laravel

networks:
  laravel:

volumes:
  db_data:
```

## 📑 PHP 容器 Dockerfile（docker/php/Dockerfile）

```dockerfile
FROM php:8.2-fpm

# 安装依赖
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libonig-dev \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql mbstring zip

# 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
```

## 📑 Nginx 配置（docker/nginx/default.conf）

```bash
server {
    listen 80;
    index index.php index.html;
    server_name localhost;

    root /var/www/html/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## 🛠️ 使用方式

```bash
# 构建并启动
docker-compose up -d --build

# 进入 PHP 容器
docker exec -it laravel_app bash

# 安装 Laravel 依赖
composer install
```

