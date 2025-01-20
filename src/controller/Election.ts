import {
    Authorized,
    CurrentUser,
    ForbiddenError,
    JsonController,
    Param,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { makeSHA } from 'web-utility';

import { dataSource, User, Voter, VoteTicket } from '../model';
import { lark, MemberBiDataTable } from '../utility';

@JsonController('/election')
export class ElectionController {
    voterStore = dataSource.getRepository(Voter);

    @Post('/:electionName/vote/ticket')
    @Authorized()
    @ResponseSchema(VoteTicket)
    async createVoteTicket(
        @CurrentUser() createdBy: User,
        @Param('electionName') electionName: string
    ): Promise<VoteTicket> {
        const { id, nickName, mobilePhone, email } = createdBy;

        const duplicatedVoter = await this.voterStore.findOneBy({
            createdBy: { id },
            electionName
        });
        if (duplicatedVoter)
            throw new ForbiddenError(
                `${nickName} has already registered for ${electionName} election`
            );
        await lark.getAccessToken();

        const [formalMember] = await new MemberBiDataTable().getList({
            手机号: mobilePhone,
            formalMember: true
        });
        if (!formalMember)
            throw new ForbiddenError(
                `${nickName} isn't a formal member who has the right to vote in ${electionName} election`
            );
        await this.voterStore.save({ electionName, createdBy });

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
