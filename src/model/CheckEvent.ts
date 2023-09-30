import { Type } from 'class-transformer';
import {
    IsInt,
    IsLatLong,
    IsMobilePhone,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

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

export class CheckEventInput
    implements Omit<UserInputData<CheckEvent>, 'user'>
{
    @IsLatLong()
    @IsOptional()
    coordinate?: string;

    @IsMobilePhone()
    mobilePhone: string;

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
    @IsMobilePhone()
    @IsOptional()
    mobilePhone?: string;

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
