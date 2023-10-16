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

export class LarkBaseTableFileTask {
    @IsString()
    base: string;

    @IsString()
    table: string;
}

export class LarkBaseTableRecordFileTask extends LarkBaseTableFileTask {
    @IsString()
    record: string;
}

export class LarkBaseTableRecordFileModel {
    @IsString({ each: true })
    files: string[];
}

export class LarkBaseTableFileModel extends LarkBaseTableRecordFileModel {
    @IsString()
    id: string;
}
