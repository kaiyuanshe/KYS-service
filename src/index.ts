import 'reflect-metadata';
import 'dotenv/config';
import Koa from 'koa';
import { useKoaServer } from 'routing-controllers';

import { router, swagger } from './controller';

const app = new Koa().use(swagger());

useKoaServer(app, router);

const { PORT = 80 } = process.env;

app.listen(PORT, () => {
    const host = `http://localhost:${PORT}`;

    console.log(`
HTTP server runs at ${host}
REST API serves at ${host}/docs
`);
});
