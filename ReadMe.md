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

- Entry: https://service.kaiyuanshe.cn/
- Document: https://service.kaiyuanshe.cn/docs/
- Schema: https://service.kaiyuanshe.cn/docs/spec/

### Type package

#### Sign in GitHub packages with NPM

1. Generate a [PAT][10] with `read:packages` authorization
2. Run Sign-in command in your terminal, and use PAT as password:

```shell
npm login --scope=@kaiyuanshe --registry=https://npm.pkg.github.com
```

#### Installation

```shell
npm i pnpm -g

pnpm i @kaiyuanshe/kys-service -D
```

## Environment variables

|         Name         |                   Usage                   |
| :------------------: | :---------------------------------------: |
|    `DATABASE_URL`    |    [PostgreSQL][11] connection string     |
|     `APP_SECRET`     |         encrypt Password & Token          |
|   `WEB_HOOK_TOKEN`   | `Authorization` token of Custom Web hooks |
| `LEANCLOUD_API_HOST` |       API domain of [LeanCloud][13]       |
|  `LEANCLOUD_APP_ID`  |         App ID of [LeanCloud][13]         |
| `LEANCLOUD_APP_KEY`  |        App Key of [LeanCloud][13]         |
|    `LARK_APP_ID`     |         App ID of [Lark API][14]          |
|  `LARK_APP_SECRET`   |       App Secret of [Lark API][14]        |
|     `HR_BASE_ID`     |      BI Table ID of HR data in Lark       |
|  `PERSON_TABLE_ID`   |  BI Data Table ID of Person data in Lark  |

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

or just press <kbd>F5</kbd> key in [VS Code][15].

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
git tag v2.0.0  # this version tag comes from ./package.json
git push origin master --tags
```

### Publish Type Package

```shell
git checkout master
git tag type-v2.0.0  # this version tag comes from ./type/package.json
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
[10]: https://github.com/settings/tokens/new?description=KYS-service&scopes=read:packages
[11]: https://www.postgresql.org/
[13]: https://www.leancloud.cn/
[14]: https://open.feishu.cn/
[15]: https://code.visualstudio.com/
