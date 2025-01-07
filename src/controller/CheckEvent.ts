import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    JsonController,
    Param,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    ActivityAgendaCheckInListChunk,
    ActivityAgendaCheckInSummary,
    ActivityCheckInListChunk,
    ActivityCheckInSummary,
    BaseFilter,
    CheckEvent,
    CheckEventChunk,
    CheckEventFilter,
    CheckEventInput,
    dataSource,
    User,
    UserActivityCheckInListChunk,
    UserActivityCheckInSummary
} from '../model';
import { ActivityLogController } from './ActivityLog';
import { FindOptionsWhere } from 'typeorm';

@JsonController('/event/check')
export class CheckEventController {
    store = dataSource.getRepository(CheckEvent);
    userStore = dataSource.getRepository(User);
    userActivityCheckInStore = dataSource.getRepository(
        UserActivityCheckInSummary
    );
    activityCheckInStore = dataSource.getRepository(ActivityCheckInSummary);
    activityAgendaCheckInStore = dataSource.getRepository(
        ActivityAgendaCheckInSummary
    );

    @Post()
    @Authorized()
    @ResponseSchema(CheckEvent)
    async createOne(
        @CurrentUser() createdBy: User,
        @Body() { user: id, ...data }: CheckEventInput
    ) {
        if (createdBy.id === id) throw new ForbiddenError('No self-checking');

        const user = await this.userStore.findOne({ where: { id } });

        if (!user) throw new BadRequestError('Invalid user: ' + id);

        const checked = await this.store.findOne({
            where: { ...data, user: { id } }
        });

        if (checked) throw new ForbiddenError('No duplicated check');

        const saved = await this.store.save({ ...data, createdBy, user });

        await ActivityLogController.logCreate(
            createdBy,
            'CheckEvent',
            saved.id
        );
        return saved;
    }

    @Get()
    @ResponseSchema(CheckEventChunk)
    async getSessionList(
        @QueryParams()
        {
            user: id,
            activityId,
            agendaId,
            pageSize = 10,
            pageIndex = 1
        }: CheckEventFilter
    ) {
        const [list, count] = await this.store.findAndCount({
            where: {
                ...(id ? { user: { id } } : {}),
                activityId,
                agendaId
            },
            relations: ['user'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }

    @Get('/user/:id')
    @ResponseSchema(UserActivityCheckInListChunk)
    async getCheckEventList(
        @Param('id') id: number,
        @QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter
    ) {
        const [list, count] = await this.userActivityCheckInStore.findAndCount({
            where: { userId: id },
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });

        for (const item of list)
            item.user = await this.userStore.findOneBy({ id: item.userId });
        return { list, count };
    }

    @Get('/activity/:id')
    @ResponseSchema(ActivityAgendaCheckInListChunk)
    async getActivityCheckEventList(
        @Param('id') id: string,
        @QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter
    ) {
        const [list, count] =
            await this.activityAgendaCheckInStore.findAndCount({
                where: { activityId: id },
                skip: pageSize * (pageIndex - 1),
                take: pageSize
            });
        return { list, count };
    }

    @Get('/activity')
    @ResponseSchema(ActivityCheckInListChunk)
    async getAgendaCheckEventList(
        @QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter
    ) {
        const [list, count] = await this.activityCheckInStore.findAndCount({
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
