import { Type } from "class-transformer";
import {
    IsEnum,
    IsInt,
    IsLatLong,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";
import { Column, Entity, ManyToOne, ViewColumn, ViewEntity } from "typeorm";

import { BaseFilter, ListChunk } from "./Base";
import { User, UserBase, UserInputData } from "./User";

@Entity()
export class CheckEvent extends UserBase {
    @IsLatLong()
    @IsOptional()
    @Column({ nullable: true })
    coordinate?: string;

    @Type(() => User)
    @ValidateNested()
    @ManyToOne(() => User)
    user: User;

    @IsString()
    @Column()
    activityId: string;

    @IsString()
    @Column()
    activityName: string;

    @IsString()
    @Column()
    agendaId: string;

    @IsString()
    @Column()
    agendaTitle: string;
}

export class CheckEventInput implements UserInputData<CheckEvent> {
    @IsLatLong()
    @IsOptional()
    coordinate?: string;

    @IsInt()
    @Min(1)
    user: number;

    @IsString()
    activityId: string;

    @IsString()
    activityName: string;

    @IsString()
    agendaId: string;

    @IsString()
    agendaTitle: string;
}

export class CheckEventFilter extends BaseFilter
    implements Partial<BaseFilter & CheckEventInput> {
    @IsInt()
    @Min(1)
    @IsOptional()
    user?: number;

    @IsString()
    @IsOptional()
    activityId?: string;

    @IsString()
    @IsOptional()
    agendaId?: string;
}

export class CheckEventChunk implements ListChunk<CheckEvent> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => CheckEvent)
    @ValidateNested({ each: true })
    list: CheckEvent[];
}

@ViewEntity({
    expression: (connection) =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, "ce")
            .leftJoin("ce.user", "user")
            .groupBy("user.id, ce.activityId,")
            .select("user.id", "userId")
            .addSelect("user.mobilePhone", "userMobilePhone")
            .addSelect("user.nickName", "userNickName")
            .addSelect("user.email", "userEmail")
            .addSelect("user.avatar", "userAvatar")
            .addSelect("ce.activityId", "activityId")
            .addSelect("ce.activityName", "activityName")
            .addSelect("COUNT(ce.id)", "checkCount"),
})
export class UserActivityCheckInSummary {
    @ViewColumn()
    userId: number;

    @ViewColumn()
    userMobilePhone: string;

    @ViewColumn()
    userNickName: string;

    @ViewColumn()
    userEmail: string;

    @ViewColumn()
    userAvatar: string;

    @ViewColumn()
    activityId: string;

    @ViewColumn()
    activityName: string;

    @ViewColumn()
    checkCount: number;

    get user(): User {
        return {
            id: this.userId,
            mobilePhone: this.userMobilePhone,
            nickName: this.userNickName,
            email: this.userEmail,
            avatar: this.userAvatar,
        } as User;
    }
}

@ViewEntity({
    expression: (connection) =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, "ce")
            .groupBy("ce.activityId, ce.agendaId")
            .select("ce.activityId", "activityId")
            .addSelect("ce.activityName", "activityName")
            .addSelect("ce.agendaId", "agendaId")
            .addSelect("ce.agendaTitle", "agendaTitle")
            .addSelect("COUNT(ce.id)", "checkCount"),
})
export class ActivityAgendaCheckInSummary {
    @ViewColumn()
    activityId: string;

    @ViewColumn()
    activityName: string;

    @ViewColumn()
    agendaId: string;

    @ViewColumn()
    agendaTitle: string;

    @ViewColumn()
    checkCount: number;
}

@ViewEntity({
    expression: (connection) =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, "ce")
            .groupBy("ce.activityId")
            .select("ce.activityId", "activityId")
            .addSelect("ce.activityName", "activityName")
            .addSelect("COUNT(ce.id)", "checkCount"),
})
export class ActivityCheckInSummary {
    @IsInt()
    @Min(1)
    @ViewColumn()
    activityId: number;

    @ViewColumn()
    activityName: string;

    @ViewColumn()
    checkCount: number;
}

export class UserActivityCheckInListChunk
    implements ListChunk<UserActivityCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => UserActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: UserActivityCheckInSummary[];
}

export class ActivityAgendaCheckInListChunk
    implements ListChunk<ActivityAgendaCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityAgendaCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityAgendaCheckInSummary[];
}

export class ActivityCheckInListChunk
    implements ListChunk<ActivityCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityCheckInSummary[];
}
