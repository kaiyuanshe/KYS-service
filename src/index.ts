import 'reflect-metadata';
import 'dotenv/config';
import Koa, { Context } from 'koa';
import KoaLogger from 'koa-logger';
import { useKoaServer } from 'routing-controllers';

import { router, swagger } from './controller';

const { PORT = 8080, WEB_HOOK_TOKEN } = process.env;

const app = new Koa().use(KoaLogger()).use(swagger());

useKoaServer(app, {
    ...router,
    authorizationChecker({ context }) {
        const [_, token] =
            (context as Context).get('Authorization')?.split(/\s+/) || [];

        return token === WEB_HOOK_TOKEN;
    }
});

app.listen(PORT, () => {
    const host = `http://localhost:${PORT}`;

    console.log(`
HTTP server runs at ${host}
REST API serves at ${host}/docs
`);
});
