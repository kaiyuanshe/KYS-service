import { IsString, IsUrl } from 'class-validator';
import { LarkData, TableRecordFields } from 'lark-ts-sdk';

export class PageTaskModel {
    @IsUrl()
    target: string;
}

export class LarkBaseTableRecordFileTask {
    @IsString()
    base: string;

    @IsString()
    table: string;

    @IsString()
    record: string;
}

export type LarkBaseTableRecordData = LarkData<{
    record: {
        id?: string;
        record_id: string;
        fields: TableRecordFields;
    };
}>;

export class LarkBaseTableRecordFileModel {
    @IsString({ each: true })
    files: string[];
}
