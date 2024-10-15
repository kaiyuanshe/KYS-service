import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsJWT,
    IsMobilePhone,
    IsOptional,
    IsString,
    IsStrongPassword,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ParameterizedContext } from 'koa';
import { NewData } from 'mobx-restful';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base, BaseFilter, InputData, ListChunk } from './Base';

export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2
}

@Entity()
export class User extends Base {
    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    uuid: string;

    @IsMobilePhone()
    @Column({ unique: true })
    mobilePhone: string;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    nickName?: string;

    @IsEnum(Gender)
    @IsOptional()
    @Column({ enum: Gender, nullable: true })
    gender?: Gender;

    @IsUrl()
    @IsOptional()
    @Column({ nullable: true })
    avatar?: string;

    @IsStrongPassword()
    @IsOptional()
    @Column({ nullable: true, select: false })
    password?: string;

    @IsJWT()
    @IsOptional()
    token?: string;

    iat?: number;
}

export class UserFilter extends BaseFilter implements Partial<InputData<User>> {
    @IsMobilePhone()
    @IsOptional()
    mobilePhone?: string;

    @IsString()
    @IsOptional()
    nickName?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}

export class UserListChunk implements ListChunk<User> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => User)
    @ValidateNested({ each: true })
    list: User[];
}

export abstract class UserBase extends Base {
    @Type(() => User)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    createdBy: User;

    @Type(() => User)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    updatedBy?: User;
}

export type UserInputData<T> = NewData<Omit<T, keyof UserBase>, Base>;

export class UserBaseFilter
    extends BaseFilter
    implements Partial<InputData<UserBase>>
{
    @IsInt()
    @Min(1)
    @IsOptional()
    createdBy?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    updatedBy?: number;
}

export class SignInData
    implements Required<Pick<User, 'mobilePhone' | 'password'>>
{
    @IsMobilePhone()
    mobilePhone: string;

    @IsString()
    password: string;
}

export class SignUpData
    extends SignInData
    implements Required<Pick<User, 'nickName' | 'mobilePhone' | 'password'>>
{
    @IsString()
    nickName: string;
}

export interface JWTAction {
    context?: ParameterizedContext<JsonWebTokenError | { user: User }>;
}
