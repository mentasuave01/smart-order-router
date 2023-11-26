import { Logger } from '@ethersproject/logger';
import { flags } from '@oclif/command';
import { Currency, V2_FACTORY_ADDRESSES, V2_FACTORY_INIT_HASH } from '@uniswap/sdk-core';
import dotenv from 'dotenv';
import _ from 'lodash';

import { ID_TO_CHAIN_ID, nativeOnChain, } from '../../src';
import { NATIVE_NAMES_BY_ID } from '../../src/util';
import { BaseCommand } from '../base-command';
import { computePairAddress } from '@uniswap/v2-sdk';

dotenv.config();

Logger.globalLogger();
Logger.setLogLevel(Logger.levels.DEBUG);

export class PoolAddressUtils extends BaseCommand {
    static description = 'Uniswap Smart Order Router CLI';

    static flags = {
        ...BaseCommand.flags,
        version: flags.version({ char: 'v' }),
        help: flags.help({ char: 'h' }),
        tokenIn: flags.string({ char: 'i', required: true }),
        tokenOut: flags.string({ char: 'o', required: true }),
        //protocols: flags.string({ required: false }),
    };

    async run() {
        const { flags } = this.parse(PoolAddressUtils);
        const {
            tokenIn: tokenInStr,
            tokenOut: tokenOutStr,
            chainId: chainIdNumb,
            //protocols: protocolsStr,
        } = flags;


        const chainId = ID_TO_CHAIN_ID(chainIdNumb);


        const tokenProvider = this.tokenProvider;

        // if the tokenIn str is 'ETH' or 'MATIC' or in NATIVE_NAMES_BY_ID
        const tokenIn: Currency = NATIVE_NAMES_BY_ID[chainId]!.includes(tokenInStr)
            ? nativeOnChain(chainId)
            : (await tokenProvider.getTokens([tokenInStr])).getTokenByAddress(
                tokenInStr
            )!;

        const tokenOut: Currency = NATIVE_NAMES_BY_ID[chainId]!.includes(
            tokenOutStr
        )
            ? nativeOnChain(chainId)
            : (await tokenProvider.getTokens([tokenOutStr])).getTokenByAddress(
                tokenOutStr
            )!;

        const pairParams: any = {

            factoryAddress: V2_FACTORY_ADDRESSES[chainId],
            tokenA: tokenIn,
            tokenB: tokenOut,
            initHashCode: V2_FACTORY_INIT_HASH[chainId],
        }

        const pairAddress = computePairAddress(pairParams);
        console.log(pairAddress);


    }
}
