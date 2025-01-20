import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { UserBase } from './User';

@Entity()
export class Voter extends UserBase {
    @IsString()
    @Column()
    electionName: string;
}

export class VoteTicket {
    @IsString()
    code: string;
}
