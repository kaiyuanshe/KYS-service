import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    JsonController,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    CheckEvent,
    CheckEventChunk,
    CheckEventFilter,
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
    async createOne(
        @CurrentUser() createdBy: User,
        @Body() data: CheckEventInput
    ) {
        const oldOne = await this.store.find({ where: { createdBy, ...data } });

        if (oldOne) throw new ForbiddenError('No duplicated check');

        return this.store.save({ ...data, createdBy });
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(CheckEventChunk)
    async getSessionList(
        @CurrentUser() createdBy: User,
        @QueryParams()
        { activityId, agendaId, pageSize, pageIndex }: CheckEventFilter
    ) {
        const [list, count] = await this.store.findAndCount({
            where: { createdBy, activityId, agendaId },
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
