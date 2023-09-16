import { IsDateString, IsInt, IsOptional } from 'class-validator';
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
