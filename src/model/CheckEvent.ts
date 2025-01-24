import { Type } from 'class-transformer';
import {
    IsInt,
    IsLatLong,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';

import { BaseFilter, ListChunk } from './Base';
import { User, UserBase, UserInputData } from './User';

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

export class CheckEventFilter
    extends BaseFilter
    implements Partial<BaseFilter & CheckEventInput>
{
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
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.activityId')
            .addGroupBy('ce.activityName')
            .select('ce.activityId', 'activityId')
            .addSelect('ce.activityName', 'activityName')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class ActivityCheckInSummary {
    @ViewColumn()
    @IsString()
    activityId: string;

    @ViewColumn()
    @IsString()
    activityName: string;

    @ViewColumn()
    @IsInt()
    @Min(0)
    checkCount: number;
}

@ViewEntity({
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.user.id')
            .addGroupBy('ce.activityId')
            .addGroupBy('ce.activityName')
            .select('ce.activityId', 'activityId')
            .addSelect('ce.user.id', 'userId')
            .addSelect('ce.activityName', 'activityName')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class UserActivityCheckInSummary extends ActivityCheckInSummary {
    @ViewColumn()
    @IsInt()
    @Min(1)
    userId: number;

    @Type(() => User)
    @ValidateNested()
    user: User;
}

@ViewEntity({
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.activityId')
            .addGroupBy('ce.activityName')
            .addGroupBy('ce.agendaId')
            .addGroupBy('ce.agendaTitle')
            .select('ce.activityId', 'activityId')
            .addSelect('ce.activityName', 'activityName')
            .addSelect('ce.agendaId', 'agendaId')
            .addSelect('ce.agendaTitle', 'agendaTitle')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class ActivityAgendaCheckInSummary extends ActivityCheckInSummary {
    @ViewColumn()
    @IsString()
    agendaId: string;

    @ViewColumn()
    @IsString()
    agendaTitle: string;
}

export class UserActivityCheckInListChunk
    implements ListChunk<UserActivityCheckInSummary>
{
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => UserActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: UserActivityCheckInSummary[];
}

export class ActivityCheckInListChunk
    implements ListChunk<ActivityCheckInSummary>
{
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityCheckInSummary[];
}

export class ActivityAgendaCheckInListChunk
    implements ListChunk<ActivityAgendaCheckInSummary>
{
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityAgendaCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityAgendaCheckInSummary[];
}
