import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min
} from 'class-validator';
import { NewData } from 'mobx-restful';
import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export enum Sort {
    DESC = 'DESC',
    ASC = 'ASC'
}

export abstract class Base {
    constructor(id?: number) {
        if (id) this.id = id;
    }

    @IsInt()
    @IsOptional()
    @PrimaryGeneratedColumn()
    id: number;

    @IsDateString()
    @IsOptional()
    @CreateDateColumn()
    createdAt: string;

    @IsDateString()
    @IsOptional()
    @UpdateDateColumn()
    updatedAt: string;
}

export type InputData<T> = NewData<Omit<T, keyof Base>, Base>;

export class BaseFilter {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageSize?: number = 10;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageIndex?: number = 1;

    @IsString()
    @IsOptional()
    keywords?: string;

    @IsEnum(Sort)
    @IsOptional()
    sort?: Sort;
}

export interface ListChunk<T> {
    count: number;
    list: T[];
}
