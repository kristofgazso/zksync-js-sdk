import { BigNumber, BigNumberish } from 'ethers';
export declare type Address = string;
export declare type PubKeyHash = string;
export declare type TokenLike = TokenSymbol | TokenAddress;
export declare type TokenSymbol = string;
export declare type TokenAddress = string;
export declare type TotalFee = Map<TokenLike, BigNumber>;
export declare type Nonce = number | 'committed';
export declare type Network = 'localhost' | 'rinkeby' | 'ropsten' | 'mainnet' | 'rinkeby-beta' | 'ropsten-beta';
export interface Create2Data {
    creatorAddress: string;
    saltArg: string;
    codeHash: string;
}
export interface AccountState {
    address: Address;
    id?: number;
    depositing: {
        balances: {
            [token: string]: {
                amount: BigNumberish;
                expectedAcceptBlock: number;
            };
        };
    };
    committed: {
        balances: {
            [token: string]: BigNumberish;
        };
        nonce: number;
        pubKeyHash: PubKeyHash;
    };
    verified: {
        balances: {
            [token: string]: BigNumberish;
        };
        nonce: number;
        pubKeyHash: PubKeyHash;
    };
}
export declare type EthSignerType = {
    verificationMethod: 'ECDSA' | 'ERC-1271';
    isSignedMsgPrefixed: boolean;
};
export interface TxEthSignature {
    type: 'EthereumSignature' | 'EIP1271Signature';
    signature: string;
}
export interface Signature {
    pubKey: string;
    signature: string;
}
export interface Transfer {
    type: 'Transfer';
    accountId: number;
    from: Address;
    to: Address;
    token: number;
    amount: BigNumberish;
    fee: BigNumberish;
    nonce: number;
    signature?: Signature;
    validFrom: number;
    validUntil: number;
}
export interface Withdraw {
    type: 'Withdraw';
    accountId: number;
    from: Address;
    to: Address;
    token: number;
    amount: BigNumberish;
    fee: BigNumberish;
    nonce: number;
    signature?: Signature;
    validFrom: number;
    validUntil: number;
}
export interface ForcedExit {
    type: 'ForcedExit';
    initiatorAccountId: number;
    target: Address;
    token: number;
    fee: BigNumberish;
    nonce: number;
    signature?: Signature;
    validFrom: number;
    validUntil: number;
}
export declare type ChangePubkeyTypes = 'Onchain' | 'ECDSA' | 'CREATE2' | 'ECDSALegacyMessage';
export interface ChangePubKeyOnchain {
    type: 'Onchain';
}
export interface ChangePubKeyECDSA {
    type: 'ECDSA';
    ethSignature: string;
    batchHash?: string;
}
export interface ChangePubKeyCREATE2 {
    type: 'CREATE2';
    creatorAddress: string;
    saltArg: string;
    codeHash: string;
}
export interface ChangePubKey {
    type: 'ChangePubKey';
    accountId: number;
    account: Address;
    newPkHash: PubKeyHash;
    feeToken: number;
    fee: BigNumberish;
    nonce: number;
    signature?: Signature;
    ethAuthData?: ChangePubKeyOnchain | ChangePubKeyECDSA | ChangePubKeyCREATE2;
    ethSignature?: string;
    validFrom: number;
    validUntil: number;
}
export interface CloseAccount {
    type: 'Close';
    account: Address;
    nonce: number;
    signature: Signature;
}
export interface SignedTransaction {
    tx: Transfer | Withdraw | ChangePubKey | CloseAccount | ForcedExit;
    ethereumSignature?: TxEthSignature;
}
export interface BlockInfo {
    blockNumber: number;
    committed: boolean;
    verified: boolean;
}
export interface TransactionReceipt {
    executed: boolean;
    success?: boolean;
    failReason?: string;
    block?: BlockInfo;
}
export interface PriorityOperationReceipt {
    executed: boolean;
    block?: BlockInfo;
}
export interface ContractAddress {
    mainContract: string;
    govContract: string;
}
export interface Tokens {
    [token: string]: {
        address: string;
        id: number;
        symbol: string;
        decimals: number;
    };
}
export interface ChangePubKeyFee {
    "ChangePubKey": ChangePubkeyTypes;
}
export interface LegacyChangePubKeyFee {
    ChangePubKey: {
        onchainPubkeyAuth: boolean;
    };
}
export interface Fee {
    feeType: 'Withdraw' | 'Transfer' | 'TransferToNew' | 'FastWithdraw' | ChangePubKeyFee;
    gasTxAmount: BigNumber;
    gasPriceWei: BigNumber;
    gasFee: BigNumber;
    zkpFee: BigNumber;
    totalFee: BigNumber;
}
export interface BatchFee {
    totalFee: BigNumber;
}
