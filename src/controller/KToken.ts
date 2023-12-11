import {
    Contract,
    ContractTransactionResponse,
    InfuraProvider,
    Wallet
} from 'ethers';
import {
    BodyParam,
    Get,
    JsonController,
    Param,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { abi } from '../meta/KToken-contract.json';
import { ContractMeta, UserMeta } from '../model';
import {
    INFURA_API_KEY,
    SEPOLIA_CONTRACT_ADDRESS,
    SEPOLIA_PVK
} from '../utility';

/**
 * Sepolia 测试网
 */
const network = 'sepolia';
/**
 * Infura 提供的接口密钥，一般是 https://sepolia.infura.io/v3/ 后面接的一串数字，
 * 这个 key 用来连接 Infura 的 RPC 端口。
 */
const provider = new InfuraProvider(network, INFURA_API_KEY);
/**
 * Ethereum Sepolia 测试网上账户的私钥，
 * 一般是合约的 owner，发送积分的交易使用该账户发放，
 * 要确保该账户有足够的钱来支付 gas fee。
 */
const signer = new Wallet(SEPOLIA_PVK, provider);

@JsonController('/KToken')
export class KTokenController {
    contract = new Contract(SEPOLIA_CONTRACT_ADDRESS, abi, signer);

    @Get('/meta')
    @ResponseSchema(ContractMeta)
    async getMeta() {
        const [name, symbol, owner, decimals, totalSupply] = await Promise.all([
            this.contract.name(),
            this.contract.symbol(),
            this.contract.owner(),
            this.contract.decimals(),
            this.contract.totalSupply()
        ]);
        return { name, symbol, owner, decimals, totalSupply };
    }

    @Get('/user/:address')
    @ResponseSchema(UserMeta)
    async getUserMeta(@Param('address') address: string) {
        const balance = await this.contract.balanceOf(address);

        return { balance };
    }

    @Post('/user/:address/transaction')
    async transferToUser(
        @Param('address') toAddress: string,
        @BodyParam('amount') amount: number
    ) {
        const transaction: ContractTransactionResponse =
            await this.contract.transfer(toAddress, amount);

        return transaction.wait();
    }
}
