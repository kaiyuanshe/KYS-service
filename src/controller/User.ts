import { JsonWebTokenError, sign } from 'jsonwebtoken';
import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    HeaderParam,
    HttpCode,
    JsonController,
    OnNull,
    OnUndefined,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    CaptchaMeta,
    dataSource,
    JWTAction,
    SignInData,
    User,
    UserFilter,
    UserListChunk
} from '../model';
import { APP_SECRET, leanClient, searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';

const store = dataSource.getRepository(User);

@JsonController('/user')
export class UserController {
    static sign = (user: User): User => ({
        ...user,
        token: sign({ ...user }, APP_SECRET)
    });

    static async signUp({ mobilePhone }: SignInData) {
        const user = await store.save({ nickName: mobilePhone, mobilePhone });

        await ActivityLogController.logCreate(user, 'User', user.id);

        return user;
    }

    static getSession = ({ context: { state } }: JWTAction) =>
        state instanceof JsonWebTokenError ? console.error(state) : state.user;

    @Get('/session')
    @Authorized()
    @ResponseSchema(User)
    getSession(@CurrentUser() user: User) {
        return user;
    }

    @Post('/session/captcha/:code/token')
    @ResponseSchema(CaptchaMeta)
    async validateCaptcha(
        @Param('code') captcha_code: string,
        @HeaderParam('Authorization') token = ''
    ) {
        const { body } = await leanClient.post<{ validate_token: string }>(
            'verifyCaptcha',
            { captcha_code, captcha_token: token.split(/\s+/)[1] }
        );
        return { token: body.validate_token };
    }

    @Post('/session/captcha')
    @ResponseSchema(CaptchaMeta)
    async createCaptcha() {
        const { body } =
            await leanClient.get<Record<`captcha_${'token' | 'url'}`, string>>(
                'requestCaptcha'
            );
        return { token: body.captcha_token, link: body.captcha_url };
    }

    @Post('/session/:phone/code')
    @OnUndefined(201)
    async createSMSCode(
        @Param('phone') mobilePhoneNumber: string,
        @HeaderParam('Authorization') token = ''
    ) {
        await leanClient.post<{}>('requestSmsCode', {
            mobilePhoneNumber,
            validate_token: token.split(/\s+/)[1]
        });
    }

    static verifySMSCode = (mobilePhoneNumber: string, code: string) =>
        leanClient.post<{}>(`verifySmsCode/${code}`, { mobilePhoneNumber });

    @Post('/session')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(@Body() { mobilePhone, code }: SignInData): Promise<User> {
        await UserController.verifySMSCode(mobilePhone, code);

        const user = await store.findOneBy({ mobilePhone });

        if (!user) await UserController.signUp({ mobilePhone, code });

        return UserController.sign(user);
    }

    @Post()
    @HttpCode(201)
    @ResponseSchema(User)
    signUp(@Body() data: SignInData) {
        return UserController.signUp(data);
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(User)
    async updateOne(
        @Param('id') id: number,
        @CurrentUser() updatedBy: User,
        @Body() data: User
    ) {
        if (id !== updatedBy.id) throw new ForbiddenError();

        const saved = await store.save({ ...data, id });

        await ActivityLogController.logUpdate(updatedBy, 'User', id);

        return UserController.sign(saved);
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(User)
    getOne(@Param('id') id: number) {
        return store.findOne({ where: { id } });
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@Param('id') id: number, @CurrentUser() deletedBy: User) {
        if (id == deletedBy.id) throw new ForbiddenError();

        await store.delete(id);
    }

    @Get()
    @ResponseSchema(UserListChunk)
    async getList(
        @QueryParams() { gender, keywords, pageSize, pageIndex }: UserFilter
    ) {
        const where = searchConditionOf<User>(
            ['mobilePhone', 'nickName'],
            keywords,
            gender && { gender }
        );
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
