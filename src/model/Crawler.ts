import { IsOptional, IsString, IsUrl } from 'class-validator';
import { AssetFetchOption } from 'web-fetch';

export class PageTask implements Pick<AssetFetchOption, 'rootSelector'> {
    @IsUrl()
    source: string;

    @IsString()
    @IsOptional()
    rootSelector?: string;
}

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

export class LarkBaseTableRecordFileModel {
    @IsString({ each: true })
    files: string[];
}
