import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    CheckEvent,
    CheckEventChunk,
    CheckEventInput,
    User,
    dataSource
} from '../model';

@JsonController('/event/check')
export class CheckEventController {
    store = dataSource.getRepository(CheckEvent);

    @Post()
    @Authorized()
    @ResponseSchema(CheckEvent)
    createOne(@CurrentUser() createdBy: User, @Body() data: CheckEventInput) {
        return this.store.save({ ...data, createdBy });
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(CheckEventChunk)
    async getSessionList(
        @CurrentUser() createdBy: User,
        @QueryParams() { pageSize, pageIndex }: BaseFilter
    ) {
        const [list, count] = await this.store.findAndCount({
            where: { createdBy },
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
