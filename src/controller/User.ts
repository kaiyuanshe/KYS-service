import { JsonWebTokenError, sign } from 'jsonwebtoken';
import { Context } from 'koa';
import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
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
import { Like } from 'typeorm';

import {
    Captcha,
    dataSource,
    Gender,
    JWTAction,
    SignInData,
    SMSCodeInput,
    User,
    UserFilter,
    UserListChunk
} from '../model';
import {
    APP_SECRET,
    blobURLOf,
    lark,
    leanClient,
    PersonBiDataTable,
    searchConditionOf,
    WEB_HOOK_TOKEN
} from '../utility';
import { ActivityLogController } from './ActivityLog';

const store = dataSource.getRepository(User);

@JsonController('/user')
export class UserController {
    static sign = (user: User): User => ({
        ...user,
        token: sign({ ...user }, APP_SECRET)
    });

    static async signUp({ mobilePhone }: SignInData) {
        await lark.getAccessToken();

        const [{ name, gender, avatar, email } = {}] =
                await new PersonBiDataTable().getList({ 手机号: mobilePhone }),
            existed = await store.findOneBy({
                mobilePhone: Like(`%${mobilePhone}`)
            });

        const saved = await store.save({
            ...existed,
            mobilePhone: existed?.mobilePhone || mobilePhone,
            email: email?.text,
            nickName: name || existed?.nickName || mobilePhone,
            gender:
                gender === '女'
                    ? Gender.Female
                    : gender === '男'
                      ? Gender.Male
                      : Gender.Other,
            avatar: blobURLOf(avatar)
        });

        if (!existed)
            await ActivityLogController.logCreate(saved, 'User', saved.id);
        else await ActivityLogController.logUpdate(saved, 'User', saved.id);

        return saved;
    }

    static getSession({ context }: JWTAction) {
        const [_, token] =
            (context as Context).get('Authorization')?.split(/\s+/) || [];

        if (token === WEB_HOOK_TOKEN) return new User(0);

        const { state } = context;

        return state instanceof JsonWebTokenError
            ? console.error(state)
            : state.user;
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(User)
    getSession(@CurrentUser() user: User) {
        return user;
    }

    @Post('/session/captcha')
    @ResponseSchema(Captcha)
    async createCaptcha() {
        const { body } =
            await leanClient.get<Record<`captcha_${'token' | 'url'}`, string>>(
                'requestCaptcha'
            );
        return { token: body.captcha_token, link: body.captcha_url };
    }

    static async verifyCaptcha(captcha_token: string, captcha_code: string) {
        const { body } = await leanClient.post<{ validate_token: string }>(
            'verifyCaptcha',
            { captcha_code, captcha_token }
        );
        return { token: body.validate_token };
    }

    @Post('/session/SMS-code')
    @OnUndefined(201)
    async createSMSCode(
        @Body() { captchaToken, captchaCode, mobilePhone }: SMSCodeInput
    ) {
        if (captchaToken && captchaCode)
            var { token } = await UserController.verifyCaptcha(
                captchaToken,
                captchaCode
            );
        await leanClient.post<{}>('requestSmsCode', {
            mobilePhoneNumber: mobilePhone,
            validate_token: token
        });
    }

    static verifySMSCode = (mobilePhoneNumber: string, code: string) =>
        leanClient.post<{}>(`verifySmsCode/${code}`, { mobilePhoneNumber });

    @Post('/session')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(@Body() { mobilePhone, code }: SignInData): Promise<User> {
        await UserController.verifySMSCode(mobilePhone, code);

        const user = await UserController.signUp({ mobilePhone, code });

        return UserController.sign(user);
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
        return store.findOneBy({ id });
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
