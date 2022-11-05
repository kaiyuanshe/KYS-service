import { IsUrl } from 'class-validator';

export class PageTaskModel {
    @IsUrl()
    target: string;
}
