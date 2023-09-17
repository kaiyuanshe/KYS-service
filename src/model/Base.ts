import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Min
} from 'class-validator';
import { NewData } from 'mobx-restful';
import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Base {
    @IsInt()
    @PrimaryGeneratedColumn()
    id: number;

    @IsDateString()
    @CreateDateColumn()
    createdAt: string;

    @IsDateString()
    @IsOptional()
    @CreateDateColumn()
    updatedAt?: string;
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
}

export interface ListChunk<T extends Base> {
    count: number;
    list: T[];
}