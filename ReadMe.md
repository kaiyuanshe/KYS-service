# KaiYuanShe service

**RESTful API** service of [KaiYuanShe][1]

[![Deploy to Production environment](https://github.com/kaiyuanshe/KYS-service/actions/workflows/deploy-production.yml/badge.svg)][2]

## API Usage

### Production environment

https://service.kaiyuanshe.cn/docs/

### Type package

#### Sign in GitHub packages with NPM

1. Generate a [PAT][3] with `read:packages` authorization
2. Run Sign-in command in your terminal:

```shell
npm login --scope=@kaiyuanshe --registry=https://npm.pkg.github.com
```

#### Installation

```shell
npm i pnpm -g

pnpm i @kaiyuanshe/kys-service
```

## Development

### Installation

```shell
npm i pnpm -g
pnpm i
```

### Start Dev Env

```shell
pnpm dev
```

### Database migration

```shell
pnpm upgrade:dev
# or
pnpm upgrade:pro
```

### Build Docker Image

```shell
pnpm dock
```

### Run Docker Image

```shell
pnpm docker
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
[3]: https://github.com/settings/tokens
