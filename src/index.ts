import 'dotenv/config';
import { installIntoGlobal } from 'iterator-helpers-polyfill';
installIntoGlobal();
import 'reflect-metadata';

import Koa, { Context } from 'koa';
import jwt from 'koa-jwt';
import KoaLogger from 'koa-logger';
import { useKoaServer } from 'routing-controllers';

import { mocker, router, swagger } from './controller';
import { SessionController } from './controller/Session';
import { dataSource } from './model';
import { AUTHING_APP_SECRET, PORT, WEB_HOOK_TOKEN, isProduct } from './utility';

const HOST = `http://localhost:${PORT}`,
    app = new Koa()
        .use(KoaLogger())
        .use(swagger({ exposeSpec: true }))
        .use(jwt({ secret: AUTHING_APP_SECRET, passthrough: true }));

if (!isProduct) app.use(mocker());

useKoaServer(app, {
    ...router,
    cors: true,
    authorizationChecker: async action => {
        const [_, token] =
            (action.context as Context).get('Authorization')?.split(/\s+/) ||
            [];

        return (
            token === WEB_HOOK_TOKEN ||
            !!(await SessionController.getSession(action))
        );
    },
    currentUserChecker: action => SessionController.getSession(action)
});

console.time('Server boot');

dataSource.initialize().then(() =>
    app.listen(PORT, () => {
        console.log(`
HTTP served at ${HOST}
Swagger API served at ${HOST}/docs/
Swagger API exposed at ${HOST}/docs/spec`);

        if (!isProduct) console.log(`Mock API served at ${HOST}/mock/\n`);

        console.timeEnd('Server boot');
    })
);
