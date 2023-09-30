import { Get, JsonController, OnNull, Param } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { User, dataSource } from '../model';

@JsonController('/user')
export class UserController {
    store = dataSource.getRepository(User);

    @Get('/:uuid')
    @OnNull(404)
    @ResponseSchema(User)
    getOne(@Param('uuid') uuid: string) {
        return this.store.findOne({ where: { uuid } });
    }
}
