import { BigNumberish, ethers } from 'ethers';
import { Address, EthSignerType, PubKeyHash, Transfer, Withdraw, ForcedExit, ChangePubKey, ChangePubKeyOnchain, ChangePubKeyECDSA, ChangePubKeyCREATE2, Create2Data } from './types';
export declare class Signer {
    #private;
    private constructor();
    pubKeyHash(): Promise<PubKeyHash>;
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    transferSignBytes(transfer: {
        accountId: number;
        from: Address;
        to: Address;
        tokenId: number;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Uint8Array;
    signSyncTransfer(transfer: {
        accountId: number;
        from: Address;
        to: Address;
        tokenId: number;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Promise<Transfer>;
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    withdrawSignBytes(withdraw: {
        accountId: number;
        from: Address;
        ethAddress: string;
        tokenId: number;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Uint8Array;
    signSyncWithdraw(withdraw: {
        accountId: number;
        from: Address;
        ethAddress: string;
        tokenId: number;
        amount: BigNumberish;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Promise<Withdraw>;
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    forcedExitSignBytes(forcedExit: {
        initiatorAccountId: number;
        target: Address;
        tokenId: number;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Uint8Array;
    signSyncForcedExit(forcedExit: {
        initiatorAccountId: number;
        target: Address;
        tokenId: number;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Promise<ForcedExit>;
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    changePubKeySignBytes(changePubKey: {
        accountId: number;
        account: Address;
        newPkHash: PubKeyHash;
        feeTokenId: number;
        fee: BigNumberish;
        nonce: number;
        validFrom: number;
        validUntil: number;
    }): Uint8Array;
    signSyncChangePubKey(changePubKey: {
        accountId: number;
        account: Address;
        newPkHash: PubKeyHash;
        feeTokenId: number;
        fee: BigNumberish;
        nonce: number;
        ethAuthData?: ChangePubKeyOnchain | ChangePubKeyECDSA | ChangePubKeyCREATE2;
        ethSignature?: string;
        validFrom: number;
        validUntil: number;
    }): Promise<ChangePubKey>;
    static fromPrivateKey(pk: Uint8Array): Signer;
    static fromSeed(seed: Uint8Array): Promise<Signer>;
    static fromETHSignature(ethSigner: ethers.Signer): Promise<{
        signer: Signer;
        ethSignatureType: EthSignerType;
    }>;
}
export declare class Create2WalletSigner extends ethers.Signer {
    zkSyncPubkeyHash: string;
    create2WalletData: Create2Data;
    readonly address: string;
    readonly salt: string;
    constructor(zkSyncPubkeyHash: string, create2WalletData: Create2Data, provider?: ethers.providers.Provider);
    getAddress(): Promise<string>;
    /**
     * This signer can't sign messages but we return zeroed signature bytes to comply with ethers API.
     */
    signMessage(_message: any): Promise<string>;
    signTransaction(_message: any): Promise<string>;
    connect(provider: ethers.providers.Provider): ethers.Signer;
}
