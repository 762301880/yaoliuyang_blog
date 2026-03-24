#  一、安装

## 1.1  `sudo命令安装composer`

```bash
sudo install composer
```

## 1.2切换`composer`镜像源

- 查看镜像源命令

```bash
composer config -g -l repo.packagist
```

- 切换镜像

> 切换阿里云镜像

```bash
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

暂时提供这一种安装方式如果日后有需要在补充

