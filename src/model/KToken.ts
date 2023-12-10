import { IsInt, IsNumber, IsString } from 'class-validator';

export class ContractMeta {
    /**
     * token 名称
     */
    @IsString()
    name: string;
    /**
     * token 符号
     */
    @IsString()
    symbol: string;
    /**
     * ERC20 合约所有者
     */
    @IsString()
    owner: string;
    /**
     * ERC20 合约小数位数
     */
    @IsInt()
    decimals: number;
    /**
     * token 总发行数
     */
    @IsInt()
    totalSupply: number;
}

export class UserMeta {
    @IsNumber()
    balance: number;
}
