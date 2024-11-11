import { IsOptional, IsString, IsUrl } from 'class-validator';
import { AssetFetchOption } from 'web-fetch';

export class PageSelector implements Pick<AssetFetchOption, 'rootSelector'> {
    @IsString()
    @IsOptional()
    rootSelector?: string;
}

export class PageTask extends PageSelector {
    @IsUrl()
    source: string;
}

export class PageTaskModel {
    @IsUrl()
    target: string;
}

export class LarkBaseTable {
    @IsString()
    base: string;

    @IsString()
    table: string;
}

export class LarkBaseTableRecord extends LarkBaseTable {
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
