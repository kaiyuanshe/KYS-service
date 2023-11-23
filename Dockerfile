# Reference: https://pnpm.io/docker#example-1-build-a-bundle-in-a-docker-container

FROM ghcr.io/puppeteer/puppeteer:latest AS base
USER root
RUN apt-get update && \
    apt-get install curl -y --no-install-recommends
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN mkdir /app
WORKDIR /app
COPY . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile
RUN pnpm build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

EXPOSE 8080
CMD ["npm", "start"]
