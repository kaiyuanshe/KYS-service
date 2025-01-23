import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { Base } from './Base';
import { UserBase } from './User';

@Entity()
export class ElectionPublicKey extends Base {
    @IsString()
    @Column()
    electionName: string;

    @IsString()
    @Column()
    jsonWebKey: string;
}

@Entity()
export class Voter extends UserBase {
    @IsString()
    @Column()
    electionName: string;
}

export class VoteTicket {
    @IsString()
    @IsOptional()
    electionName: string;

    @IsString()
    publicKey: string;

    @IsString()
    signature: string;
}

export class VoteVerification extends VoteTicket {
    @IsBoolean()
    verified: boolean;
}
