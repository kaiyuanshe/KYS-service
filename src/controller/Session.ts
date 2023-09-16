import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import {
    Authorized,
    CurrentUser,
    Get,
    HeaderParam,
    JsonController,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Repository } from 'typeorm';

import { AuthingSession, JWTAction, User, dataSource } from '../model';
import { AUTHING_APP_SECRET } from '../utility';

@JsonController('/user/session')
export class SessionController {
    store = dataSource.getRepository(User);

    static async register(
        store: Repository<User>,
        data: Partial<Omit<User, 'createdAt' | 'updatedAt'>>
    ) {
        const { id } = await store.save(data);

        return store.findOne({ where: { id } });
    }

    static signToken(user: User) {
        return { ...user, token: sign({ ...user }, AUTHING_APP_SECRET) };
    }

    static getAuthingUser(token: string): AuthingSession {
        var { phone_number, ...session } = verify(
            token.split(/\s+/)[1],
            AUTHING_APP_SECRET
        ) as AuthingSession;

        if (phone_number && !phone_number.startsWith('+86'))
            phone_number = '+86' + phone_number;

        return { ...session, phone_number };
    }

    static async getSession({ context: { state } }: JWTAction) {
        if (state instanceof JsonWebTokenError) return console.error(state);

        const { user } = state;

        return !('userpool_id' in user)
            ? user
            : dataSource
                  .getRepository(User)
                  .findOne({ where: { mobilePhone: user.phone_number } });
    }

    @Get()
    @Authorized()
    @ResponseSchema(User)
    getSession(@CurrentUser() user: User) {
        return user;
    }

    @Post('/authing')
    @ResponseSchema(User)
    async signInAuthing(
        @HeaderParam('Authorization', { required: true }) token: string
    ) {
        const {
            phone_number: mobilePhone,
            nickname,
            picture
        } = SessionController.getAuthingUser(token);

        const existed = await this.store.findOne({ where: { mobilePhone } });

        const registered = await SessionController.register(this.store, {
            ...existed,
            mobilePhone,
            nickName: nickname,
            avatar: picture
        });
        return SessionController.signToken(registered);
    }
}
