import { HTTPClient, HTTPError } from 'koajax';
import {
    BiDataQueryOptions,
    BiDataTable,
    LarkApp,
    makeSimpleFilter,
    TableCellAttachment,
    TableCellLink,
    TableCellMedia,
    TableCellValue
} from 'mobx-lark';
import { Filter } from 'mobx-restful';
import { HttpError } from 'routing-controllers';
import { FindOptionsWhere, ILike } from 'typeorm';

import { Base } from './model';

export const {
    NODE_ENV,
    PORT = 8080,
    DATABASE_URL,
    WEB_HOST,
    WEB_HOOK_TOKEN,
    APP_SECRET,
    LEANCLOUD_API_HOST,
    LEANCLOUD_APP_ID,
    LEANCLOUD_APP_KEY,
    LARK_APP_ID,
    LARK_APP_SECRET,
    HR_BASE_ID,
    PERSON_TABLE_ID,
    INFURA_API_KEY,
    SEPOLIA_PVK,
    SEPOLIA_CONTRACT_ADDRESS
} = process.env;

export const isProduct = NODE_ENV === 'production';

export const searchConditionOf = <T extends Base>(
    keys: (keyof T)[],
    keywords = '',
    filter?: FindOptionsWhere<T>
) =>
    keywords
        ? keys.map(key => ({ [key]: ILike(`%${keywords}%`), ...filter }))
        : filter;

export const leanClient = new HTTPClient({
    baseURI: `https://${LEANCLOUD_API_HOST}/1.1/`,
    responseType: 'json'
}).use(async ({ request }, next) => {
    request.headers = {
        ...request.headers,
        'X-LC-Id': LEANCLOUD_APP_ID,
        'X-LC-Key': LEANCLOUD_APP_KEY
    };
    try {
        await next();
    } catch (error) {
        const { response } = error as HTTPError<{
            code: number;
            error: string;
        }>;
        const { status, body } = response;

        throw new HttpError(status, body.error);
    }
});

export const lark = new LarkApp({
    id: LARK_APP_ID,
    secret: LARK_APP_SECRET
});

export interface Person extends Record<'name' | 'gender' | '手机号', string> {
    email: TableCellLink;
    avatar: TableCellValue;
    formalMember: boolean;
}

export class PersonBiDataTable extends BiDataTable<Person>() {
    client = lark.client;
    queryOptions: BiDataQueryOptions = { text_field_as_array: false };

    constructor(appId = HR_BASE_ID, tableId = PERSON_TABLE_ID) {
        super(appId, tableId);
    }
}

export class MemberBiDataTable extends PersonBiDataTable {
    makeFilter(filter: Filter<Person>) {
        return makeSimpleFilter(filter, '=');
    }
}

export function fileURLOf(field: TableCellValue) {
    if (!(field instanceof Array) || !field[0]) return field + '';

    const file = field[0] as TableCellMedia | TableCellAttachment;

    return (
        new URL(
            `api/lark/file/${'file_token' in file ? file.file_token : file.attachmentToken}`,
            WEB_HOST
        ) + ''
    );
}
