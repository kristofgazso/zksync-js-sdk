import { AbstractJSONRPCTransport } from './transport';
import { BigNumber, ethers } from 'ethers';
import { AccountState, Address, ChangePubKeyFee, ContractAddress, Fee, LegacyChangePubKeyFee, Network, PriorityOperationReceipt, TokenAddress, TokenLike, Tokens, TransactionReceipt, TxEthSignature } from './types';
import { TokenSet } from './utils';
export declare function getDefaultProvider(network: Network, transport?: 'WS' | 'HTTP'): Promise<Provider>;
export declare class Provider {
    transport: AbstractJSONRPCTransport;
    contractAddress: ContractAddress;
    tokenSet: TokenSet;
    pollIntervalMilliSecs: number;
    private constructor();
    /**
     * @deprecated Websocket support will be removed in future. Use HTTP transport instead.
     */
    static newWebsocketProvider(address: string): Promise<Provider>;
    static newHttpProvider(address?: string, pollIntervalMilliSecs?: number): Promise<Provider>;
    /**
     * Provides some hardcoded values the `Provider` responsible for
     * without communicating with the network
     */
    static newMockProvider(network: string, ethPrivateKey: Uint8Array, getTokens: Function): Promise<Provider>;
    submitTx(tx: any, signature?: TxEthSignature, fastProcessing?: boolean): Promise<string>;
    submitTxsBatch(transactions: {
        tx: any;
        signature?: TxEthSignature;
    }[], ethSignatures?: TxEthSignature | TxEthSignature[]): Promise<string[]>;
    getContractAddress(): Promise<ContractAddress>;
    getTokens(): Promise<Tokens>;
    updateTokenSet(): Promise<void>;
    getState(address: Address): Promise<AccountState>;
    getTxReceipt(txHash: string): Promise<TransactionReceipt>;
    getPriorityOpStatus(serialId: number): Promise<PriorityOperationReceipt>;
    getConfirmationsForEthOpAmount(): Promise<number>;
    getEthTxForWithdrawal(withdrawal_hash: string): Promise<string>;
    notifyPriorityOp(serialId: number, action: 'COMMIT' | 'VERIFY'): Promise<PriorityOperationReceipt>;
    notifyTransaction(hash: string, action: 'COMMIT' | 'VERIFY'): Promise<TransactionReceipt>;
    getTransactionFee(txType: 'Withdraw' | 'Transfer' | 'FastWithdraw' | ChangePubKeyFee | LegacyChangePubKeyFee, address: Address, tokenLike: TokenLike): Promise<Fee>;
    getTransactionsBatchFee(txTypes: ('Withdraw' | 'Transfer' | 'FastWithdraw' | ChangePubKeyFee | LegacyChangePubKeyFee)[], addresses: Address[], tokenLike: TokenLike): Promise<BigNumber>;
    getTokenPrice(tokenLike: TokenLike): Promise<number>;
    disconnect(): Promise<any>;
}
export declare class ETHProxy {
    private ethersProvider;
    contractAddress: ContractAddress;
    private governanceContract;
    constructor(ethersProvider: ethers.providers.Provider, contractAddress: ContractAddress);
    resolveTokenId(token: TokenAddress): Promise<number>;
}
