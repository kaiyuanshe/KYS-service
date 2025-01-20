import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    JsonController,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { makeSHA } from 'web-utility';

import { dataSource, User, Voter, VoteTicket } from '../model';
import { ActivityLogController } from './ActivityLog';

@JsonController('/election')
export class ElectionController {
    voterStore = dataSource.getRepository(Voter);

    @Post('/:electionName/vote/ticket')
    @Authorized()
    @ResponseSchema(VoteTicket)
    async createVoteTicket(
        @CurrentUser() createdBy: User,
        @Body() { electionName }: Voter
    ): Promise<VoteTicket> {
        const duplicatedVoter = await this.voterStore.findOneBy({
            createdBy,
            electionName
        });
        if (duplicatedVoter)
            throw new ForbiddenError(
                `${createdBy.nickName} has already registered for ${electionName}`
            );
        const { nickName, mobilePhone, email } = createdBy;

        const { id } = await this.voterStore.save({ electionName, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Voter', id);

        const meta = [
            nickName,
            mobilePhone,
            email,
            electionName,
            Math.random()
        ];
        return { code: await makeSHA(meta + '') };
    }
}
