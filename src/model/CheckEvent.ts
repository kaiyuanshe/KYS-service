import { Type } from 'class-transformer';
import {
    IsInt,
    IsLatLong,
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
