import { BigNumber, BigNumberish, Contract, ContractTransaction, ethers } from 'ethers';
import { EthMessageSigner } from './eth-message-signer';
import { Provider } from './provider';
import { Signer } from './signer';
import { BatchBuilder } from './batch-builder';
import { AccountState, Address, TokenLike, Nonce, PriorityOperationReceipt, TransactionReceipt, PubKeyHash, ChangePubKey, EthSignerType, SignedTransaction, Transfer, TxEthSignature, ForcedExit, Withdraw, ChangePubkeyTypes, ChangePubKeyOnchain, ChangePubKeyECDSA, ChangePubKeyCREATE2, Create2Data } from './types';
export declare class ZKSyncTxError extends Error {
    value: PriorityOperationReceipt | TransactionReceipt;
    constructor(message: string, value: PriorityOperationReceipt | TransactionReceipt);
}
export declare class Wallet {
    ethSigner: ethers.Signer;
    ethMessageSigner: EthMessageSigner;
    cachedAddress: Address;
    signer?: Signer;
    accountId?: number;
    ethSignerType?: EthSignerType;
    provider: Provider;
    private constructor();
    connect(provider: Provider): this;
    static fromEthSigner(ethWallet: ethers.Signer, provider: Provider, signer?: Signer, accountId?: number, ethSignerType?: EthSignerType): Promise<Wallet>;
    static fromCreate2Data(syncSigner: Signer, provider: Provider, create2Data: Create2Data, accountId?: number): Promise<Wallet>;
    static fromEthSignerNoKeys(ethWallet: ethers.Signer, provider: Provider, accountId?: number, ethSignerType?: EthSignerType): Promise<Wallet>;
    getEthMessageSignature(message: ethers.utils.BytesLike): Promise<TxEthSignature>;
    batchBuilder(nonce?: Nonce): BatchBuilder;
    getTransfer(transfer: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Promise<Transfer>;
    signSyncTransfer(transfer: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom?: number;
        validUntil?: number;
    }): Promise<SignedTransaction>;
    getForcedExit(forcedExit: {
        target: Address;
        token: TokenLike;
        fee: BigNumberish;
        nonce: number;
        validFrom?: number;
        validUntil?: number;
    }): Promise<ForcedExit>;
    signSyncForcedExit(forcedExit: {
        target: Address;
        token: TokenLike;
        fee: BigNumberish;
        nonce: number;
        validFrom?: number;
        validUntil?: number;
    }): Promise<SignedTransaction>;
    syncForcedExit(forcedExit: {
        target: Address;
        token: TokenLike;
        fee?: BigNumberish;
        nonce?: Nonce;
        validFrom?: number;
        validUntil?: number;
    }): Promise<Transaction>;
    syncMultiTransfer(transfers: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce?: Nonce;
        validFrom?: number;
        validUntil?: number;
    }[]): Promise<Transaction[]>;
    syncTransfer(transfer: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee?: BigNumberish;
        nonce?: Nonce;
        validFrom?: number;
        validUntil?: number;
    }): Promise<Transaction>;
    getWithdrawFromSyncToEthereum(withdraw: {
        ethAddress: string;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Promise<Withdraw>;
    signWithdrawFromSyncToEthereum(withdraw: {
        ethAddress: string;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom?: number;
        validUntil?: number;
    }): Promise<SignedTransaction>;
    withdrawFromSyncToEthereum(withdraw: {
        ethAddress: string;
        token: TokenLike;
        amount: BigNumberish;
        fee?: BigNumberish;
        nonce?: Nonce;
        fastProcessing?: boolean;
        validFrom?: number;
        validUntil?: number;
    }): Promise<Transaction>;
    isSigningKeySet(): Promise<boolean>;
    getChangePubKey(changePubKey: {
        feeToken: TokenLike;
        fee: BigNumberish;
        nonce: number;
        ethAuthData?: ChangePubKeyOnchain | ChangePubKeyECDSA | ChangePubKeyCREATE2;
        ethSignature?: string;
        validFrom: number;
        validUntil: number;
    }): Promise<ChangePubKey>;
    signSetSigningKey(changePubKey: {
        feeToken: TokenLike;
        fee: BigNumberish;
        nonce: number;
        ethAuthType: ChangePubkeyTypes;
        batchHash?: string;
        validFrom?: number;
        validUntil?: number;
    }): Promise<SignedTransaction>;
    setSigningKey(changePubKey: {
        feeToken: TokenLike;
        ethAuthType: ChangePubkeyTypes;
        fee?: BigNumberish;
        nonce?: Nonce;
        validFrom?: number;
        validUntil?: number;
    }): Promise<Transaction>;
    getTransferEthMessagePart(transfer: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
    }): string;
    getWithdrawEthMessagePart(withdraw: {
        ethAddress: string;
        token: TokenLike;
        amount: BigNumberish;
        fee: BigNumberish;
    }): string;
    getChangePubKeyEthMessagePart(changePubKey: {
        pubKeyHash: string;
        feeToken: TokenLike;
        fee: BigNumberish;
    }): string;
    getForcedExitEthMessagePart(forcedExit: {
        target: Address;
        token: TokenLike;
        fee: BigNumberish;
        nonce: number;
    }): string;
    isOnchainAuthSigningKeySet(nonce?: Nonce): Promise<boolean>;
    onchainAuthSigningKey(nonce?: Nonce, ethTxOptions?: ethers.providers.TransactionRequest): Promise<ContractTransaction>;
    getCurrentPubKeyHash(): Promise<PubKeyHash>;
    getNonce(nonce?: Nonce): Promise<number>;
    getAccountId(): Promise<number | undefined>;
    address(): Address;
    getAccountState(): Promise<AccountState>;
    getBalance(token: TokenLike, type?: 'committed' | 'verified'): Promise<BigNumber>;
    getEthereumBalance(token: TokenLike): Promise<BigNumber>;
    isERC20DepositsApproved(token: TokenLike, erc20ApproveThreshold?: BigNumber): Promise<boolean>;
    approveERC20TokenDeposits(token: TokenLike, max_erc20_approve_amount?: BigNumber): Promise<ContractTransaction>;
    depositToSyncFromEthereum(deposit: {
        depositTo: Address;
        token: TokenLike;
        amount: BigNumberish;
        ethTxOptions?: ethers.providers.TransactionRequest;
        approveDepositAmountForERC20?: boolean;
    }): Promise<ETHOperation>;
    emergencyWithdraw(withdraw: {
        token: TokenLike;
        accountId?: number;
        ethTxOptions?: ethers.providers.TransactionRequest;
    }): Promise<ETHOperation>;
    getZkSyncMainContract(): Contract;
    private modifyEthersError;
    private setRequiredAccountIdFromServer;
}
export declare class ETHOperation {
    ethTx: ContractTransaction;
    zkSyncProvider: Provider;
    state: 'Sent' | 'Mined' | 'Committed' | 'Verified' | 'Failed';
    error?: ZKSyncTxError;
    priorityOpId?: BigNumber;
    constructor(ethTx: ContractTransaction, zkSyncProvider: Provider);
    awaitEthereumTxCommit(): Promise<ethers.ContractReceipt>;
    awaitReceipt(): Promise<PriorityOperationReceipt>;
    awaitVerifyReceipt(): Promise<PriorityOperationReceipt>;
    private setErrorState;
    private throwErrorIfFailedState;
}
export declare class Transaction {
    txData: any;
    txHash: string;
    sidechainProvider: Provider;
    state: 'Sent' | 'Committed' | 'Verified' | 'Failed';
    error?: ZKSyncTxError;
    constructor(txData: any, txHash: string, sidechainProvider: Provider);
    awaitReceipt(): Promise<TransactionReceipt>;
    awaitVerifyReceipt(): Promise<TransactionReceipt>;
    private setErrorState;
    private throwErrorIfFailedState;
}
export declare function submitSignedTransaction(signedTx: SignedTransaction, provider: Provider, fastProcessing?: boolean): Promise<Transaction>;
export declare function submitSignedTransactionsBatch(provider: Provider, signedTxs: SignedTransaction[], ethSignatures?: TxEthSignature[]): Promise<Transaction[]>;
