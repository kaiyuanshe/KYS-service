import {
    IsEnum,
    IsMobilePhone,
    IsOptional,
    IsString,
    IsUrl
} from 'class-validator';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { Column, Entity } from 'typeorm';

import { ParameterizedContext } from 'koa';
import { Base } from './Base';

export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2
}

@Entity()
export class User extends Base {
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
}

export type AuthingAddress = Partial<
    Record<'country' | 'postal_code' | 'region' | 'formatted', string>
>;

export type AuthingUser = Record<
    'type' | 'userPoolId' | 'appId' | 'id' | '_id' | 'userId' | 'clientId',
    string
> &
    Partial<
        Record<'email' | 'phone' | 'username' | 'unionid' | 'openid', string>
    >;

export interface AuthingSession
    extends JwtPayload,
        Pick<AuthingUser, 'username' | 'unionid'>,
        Record<'userpool_id' | 'gender' | 'picture', string>,
        Partial<
            Record<
                | 'external_id'
                | 'email'
                | 'website'
                | 'phone_number'
                | 'name'
                | 'preferred_username'
                | 'nickname'
                | 'family_name'
                | 'middle_name'
                | 'given_name'
                | 'birthdate'
                | 'locale'
                | 'zoneinfo',
                string
            >
        > {
    phone_number_verified: boolean;
    email_verified: boolean;

    data: AuthingUser;
    profile?: any;
    address: AuthingAddress;

    updated_at: Date;
}

export interface JWTAction {
    context?: ParameterizedContext<
        JsonWebTokenError | { user: User | AuthingSession }
    >;
}
