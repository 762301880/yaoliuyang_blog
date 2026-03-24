#  资料

| name              | url                                                          |
| ----------------- | ------------------------------------------------------------ |
| 第三方博客        | [link](https://segmentfault.com/a/1190000011749037)          |
| 项目官方文档      | [link](https://spatie.be/docs/laravel-backup/v5/introduction) |
| packagist项目地址 | [link](https://packagist.org/packages/spatie/laravel-backup) |

#  [spatie/](https://packagist.org/packages/spatie/)laravel-backup安装&使用

## 安装

- 使用composer安装

```bash
composer require spatie/laravel-backup
```

- 注册服务提供者（config/app.php）：

```bash
'providers' => [
    // ...
    Spatie\Backup\BackupServiceProvider::class,
];
```

- 发布配置文件

```bash
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

