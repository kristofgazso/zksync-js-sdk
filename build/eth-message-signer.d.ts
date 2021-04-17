import * as ethers from 'ethers';
import { TxEthSignature, EthSignerType, PubKeyHash } from './types';
/**
 * Wrapper around `ethers.Signer` which provides convenient methods to get and sign messages required for zkSync.
 */
export declare class EthMessageSigner {
    private ethSigner;
    private ethSignerType?;
    constructor(ethSigner: ethers.Signer, ethSignerType?: EthSignerType);
    getEthMessageSignature(message: ethers.utils.BytesLike): Promise<TxEthSignature>;
    getTransferEthSignMessage(transfer: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        to: string;
        nonce: number;
        accountId: number;
    }): string;
    ethSignTransfer(transfer: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        to: string;
        nonce: number;
        accountId: number;
    }): Promise<TxEthSignature>;
    ethSignForcedExit(forcedExit: {
        stringToken: string;
        stringFee: string;
        target: string;
        nonce: number;
    }): Promise<TxEthSignature>;
    getWithdrawEthSignMessage(withdraw: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        ethAddress: string;
        nonce: number;
        accountId: number;
    }): string;
    getForcedExitEthSignMessage(forcedExit: {
        stringToken: string;
        stringFee: string;
        target: string;
        nonce: number;
    }): string;
    getTransferEthMessagePart(tx: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        ethAddress?: string;
        to?: string;
    }): string;
    getWithdrawEthMessagePart(tx: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        ethAddress?: string;
        to?: string;
    }): string;
    getChangePubKeyEthMessagePart(changePubKey: {
        pubKeyHash: PubKeyHash;
        stringToken: string;
        stringFee: string;
    }): string;
    getForcedExitEthMessagePart(forcedExit: {
        stringToken: string;
        stringFee: string;
        target: string;
    }): string;
    ethSignWithdraw(withdraw: {
        stringAmount: string;
        stringToken: string;
        stringFee: string;
        ethAddress: string;
        nonce: number;
        accountId: number;
    }): Promise<TxEthSignature>;
    getChangePubKeyEthSignMessage(changePubKey: {
        pubKeyHash: PubKeyHash;
        nonce: number;
        accountId: number;
    }): Uint8Array;
    ethSignChangePubKey(changePubKey: {
        pubKeyHash: PubKeyHash;
        nonce: number;
        accountId: number;
    }): Promise<TxEthSignature>;
}
