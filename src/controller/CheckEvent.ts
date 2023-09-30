import {
    Authorized,
    BadRequestError,
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
    userStore = dataSource.getRepository(User);

    @Post()
    @Authorized()
    @ResponseSchema(CheckEvent)
    async createOne(
        @CurrentUser() createdBy: User,
        @Body() { mobilePhone, ...data }: CheckEventInput
    ) {
        const user = await this.userStore.findOne({ where: { mobilePhone } });

        if (!user) throw new BadRequestError('Invalid user: ' + mobilePhone);

        const oldOne = await this.store.findOne({
            where: { ...data, user: { id: user.id } }
        });

        if (oldOne) throw new ForbiddenError('No duplicated check');

        return this.store.save({ ...data, createdBy, user });
    }

    @Get()
    @ResponseSchema(CheckEventChunk)
    async getSessionList(
        @QueryParams()
        {
            mobilePhone,
            activityId,
            agendaId,
            pageSize = 10,
            pageIndex = 1
        }: CheckEventFilter
    ) {
        const [list, count] = await this.store.findAndCount({
            where: {
                user: { mobilePhone },
                activityId,
                agendaId
            },
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
