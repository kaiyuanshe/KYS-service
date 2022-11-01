import 'reflect-metadata';
import Koa from 'koa';
import { useKoaServer } from 'routing-controllers';

import { controllers } from './controller';

const app = new Koa();

useKoaServer(app, { controllers });

const { PORT = 80 } = process.env;

app.listen(PORT, () => {
    const host = `http://localhost:${PORT}`;

    console.log(`HTTP server runs at ${host}`);
});
