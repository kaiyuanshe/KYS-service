import {
    Authorized,
    Body,
    BodyParam,
    CurrentUser,
    ForbiddenError,
    JsonController,
    Param,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    ElectionPublicKey,
    User,
    Voter,
    VoteTicket,
    VoteVerification
} from '../model';
import { lark, MemberBiDataTable } from '../utility';

@JsonController('/election')
export class ElectionController {
    voterStore = dataSource.getRepository(Voter);
    publicKeyStore = dataSource.getRepository(ElectionPublicKey);
    algorithm = {
        name: 'ECDSA',
        namedCurve: 'P-384',
        hash: { name: 'SHA-256' }
    };

    @Post('/:electionName/public-key')
    @Authorized()
    @ResponseSchema(ElectionPublicKey)
    async savePublicKey(
        @CurrentUser() createdBy: User,
        @Param('electionName') electionName: string,
        @BodyParam('jsonWebKey') jsonWebKey: string
    ) {
        const { id, nickName, mobilePhone } = createdBy;

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
            手机号: mobilePhone.replace(/^\+86-?/, ''),
            formalMember: true
        });
        if (!formalMember)
            throw new ForbiddenError(
                `${nickName} isn't a formal member who has the right to vote in ${electionName} election`
            );
        const publicKey = await this.publicKeyStore.save({
            electionName,
            jsonWebKey
        });
        await this.voterStore.save({ createdBy, electionName });

        return publicKey;
    }

    @Post('/:electionName/vote/verification')
    @Authorized()
    @ResponseSchema(VoteVerification)
    async verifyVote(
        @Param('electionName') electionName: string,
        @Body() { publicKey, signature }: VoteTicket
    ) {
        const registration = await this.publicKeyStore.findOneBy({
            electionName,
            jsonWebKey: publicKey
        });
        if (!registration)
            return { electionName, publicKey, signature, verified: false };

        const key = await crypto.subtle.importKey(
            'jwk',
            JSON.parse(atob(publicKey)),
            this.algorithm,
            true,
            ['verify']
        );
        const verified = await crypto.subtle.verify(
            this.algorithm,
            key,
            Buffer.from(signature, 'hex'),
            new TextEncoder().encode(electionName)
        );
        return { electionName, publicKey, signature, verified };
    }
}
