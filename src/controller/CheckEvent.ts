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
    QueryParams,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import {
    ActivityCheckInListChunk,
    BaseFilter,
    CheckEvent,
    CheckEventChunk,
    CheckEventFilter,
    CheckEventInput,
    dataSource,
    User,
    UserActivityCheckInListChunk,
} from "../model";
import { ActivityLogController } from "./ActivityLog";
import { FindOptionsWhere } from "typeorm";

@JsonController("/event/check")
export class CheckEventController {
    store = dataSource.getRepository(CheckEvent);
    userStore = dataSource.getRepository(User);

    @Post()
    @Authorized()
    @ResponseSchema(CheckEvent)
    async createOne(
        @CurrentUser() createdBy: User,
        @Body() { user: id, ...data }: CheckEventInput,
    ) {
        if (createdBy.id === id) throw new ForbiddenError("No self-checking");

        const user = await this.userStore.findOne({ where: { id } });

        if (!user) throw new BadRequestError("Invalid user: " + id);

        const checked = await this.store.findOne({
            where: { ...data, user: { id } },
        });

        if (checked) throw new ForbiddenError("No duplicated check");

        const saved = await this.store.save({ ...data, createdBy, user });

        await ActivityLogController.logCreate(
            createdBy,
            "CheckEvent",
            saved.id,
        );
        return saved;
    }

    @Get()
    @ResponseSchema(CheckEventChunk)
    async getSessionList(
        @QueryParams() {
            user: id,
            activityId,
            agendaId,
            pageSize = 10,
            pageIndex = 1,
        }: CheckEventFilter,
    ) {
        const [list, count] = await this.store.findAndCount({
            where: {
                ...(id ? { user: { id } } : {}),
                activityId,
                agendaId,
            },
            relations: ["user"],
            skip: pageSize * (pageIndex - 1),
            take: pageSize,
        });
        return { list, count };
    }

    @Get("/user/:id")
    @ResponseSchema(UserActivityCheckInListChunk)
    getCheckEventList(
        @Param("id") id: number,
        @QueryParams() filter: BaseFilter,
    ) {
        return this.queryList(
            { user: { id } },
            filter,
            ["user"],
        );
    }

    @Get("/activity/:id")
    @ResponseSchema(ActivityCheckInListChunk)
    getActivityCheckEventList(
        @Param("id") id: string,
        @QueryParams() filter: BaseFilter,
    ) {
        return this.queryList({ activityId: id }, filter);
    }

    @Get("/activity")
    @ResponseSchema(ActivityCheckInListChunk)
    getAgendaCheckEventList(
        @Param("id") id: string,
        @QueryParams() filter: BaseFilter,
    ) {
        return this.queryList({ agendaId: id }, filter);
    }

    async queryList(
        where: FindOptionsWhere<CheckEvent>,
        { pageSize, pageIndex, sort }: BaseFilter,
        relations?: string[],
    ) {
        const skip = pageSize * (pageIndex - 1);

        const [list, count] = await this.store.findAndCount({
            where,
            relations,
            skip,
            take: pageSize,
        });
        return { list, count };
    }
}
