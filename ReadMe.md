# KaiYuanShe service

**RESTful API** service of [KaiYuanShe][1]

[![Deploy to Production environment](https://github.com/kaiyuanshe/KYS-service/actions/workflows/deploy-production.yml/badge.svg)][2]

## Technology stack

1. HTTP server: [Koa][3]
2. Controller framework: [Routing Controllers][4]
3. Model framework: [Class Transformer][5] & [Class Validator][6]
4. ORM framework: [TypeORM][7]
5. API document: [Swagger][8]
6. Mock API: [OpenAPI backend][9]

## API Usage

### Production environment

-   Entry: https://service.kaiyuanshe.cn/
-   Document: https://service.kaiyuanshe.cn/docs/
-   Schema: https://service.kaiyuanshe.cn/docs/spec/

### Type package

#### Sign in GitHub packages with NPM

1. Generate a [PAT][10] with `read:packages` authorization
2. Run Sign-in command in your terminal:

```shell
npm login --scope=@kaiyuanshe --registry=https://npm.pkg.github.com
```

#### Installation

```shell
npm i pnpm -g

pnpm i @kaiyuanshe/kys-service
```

## Environment variables

|          Name           |                   Usage                   |
| :---------------------: | :---------------------------------------: |
|     `DATABASE_URL`      |    [PostgreSQL][11] connection string     |
| `AZURE_BLOB_CONNECTION` |     [Azure Blob Storage][12] service      |
|    `WEB_HOOK_TOKEN`     | `Authorization` token of Custom Web hooks |
|  `AUTHING_APP_SECRET`   |         encrypt Password & Token          |
|      `LARK_APP_ID`      |         App ID of [Lark API][13]          |
|    `LARK_APP_SECRET`    |       App Secret of [Lark API][13]        |

## Development

### Installation

```shell
npm i pnpm -g
pnpm i
```

### Start Development environment

```shell
pnpm dev
```

or just press <kbd>F5</kbd> key in [VS Code][14].

### Migration

```shell
pnpm upgrade:dev
```

## Deployment

### Start Production environment

```shell
npm start
```

### Migration

```shell
pnpm upgrade:pro
```

### Docker

```shell
pnpm pack-image
pnpm container
```

## Releasing

### Deploy Application

```shell
git checkout master
git tag v0.6.0  # this version tag comes from ./package.json
git push origin master --tags
```

### Publish Type Package

```shell
git checkout master
git tag type-v0.6.0  # this version tag comes from ./type/package.json
git push origin master --tags
```

[1]: https://kaiyuanshe.cn
[2]: https://github.com/kaiyuanshe/KYS-service/actions/workflows/deploy-production.yml
[3]: https://koajs.com/
[4]: https://github.com/typestack/routing-controllers
[5]: https://github.com/typestack/class-transformer
[6]: https://github.com/typestack/class-validator
[7]: https://typeorm.io/
[8]: https://swagger.io/
[9]: https://github.com/anttiviljami/openapi-backend
[10]: https://github.com/settings/tokens
[11]: https://www.postgresql.org/
[12]: https://azure.microsoft.com/en-us/products/storage/blobs
[13]: https://open.feishu.cn/
[14]: https://code.visualstudio.com/
