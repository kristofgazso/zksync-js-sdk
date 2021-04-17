import { BigNumberish } from 'ethers';
import { Address, TokenLike, Nonce, SignedTransaction, TxEthSignature, ChangePubkeyTypes, TotalFee } from './types';
import { Wallet } from './wallet';
/**
 * Provides iterface for constructing batches of transactions.
 */
export declare class BatchBuilder {
    private wallet;
    private nonce;
    private txs;
    private constructor();
    static fromWallet(wallet: Wallet, nonce?: Nonce): BatchBuilder;
    /**
     * Construct the batch from the given transactions.
     * Returs it with the corresponding Ethereum signature and total fee.
     * @param feeToken If provided, the fee for the whole batch will be obtained from the server in this token.
     * Possibly creates phantom transfer.
     */
    build(feeToken?: TokenLike): Promise<{
        txs: SignedTransaction[];
        signature: TxEthSignature;
        totalFee: TotalFee;
    }>;
    private setFeeToken;
    addWithdraw(withdraw: {
        ethAddress: string;
        token: TokenLike;
        amount: BigNumberish;
        fee?: BigNumberish;
        fastProcessing?: boolean;
        validFrom?: number;
        validUntil?: number;
    }): BatchBuilder;
    addTransfer(transfer: {
        to: Address;
        token: TokenLike;
        amount: BigNumberish;
        fee?: BigNumberish;
        validFrom?: number;
        validUntil?: number;
    }): BatchBuilder;
    addChangePubKey(changePubKey: {
        feeToken: TokenLike;
        ethAuthType: ChangePubkeyTypes;
        fee?: BigNumberish;
        validFrom?: number;
        validUntil?: number;
    } | SignedTransaction): BatchBuilder;
    addForcedExit(forcedExit: {
        target: Address;
        token: TokenLike;
        fee?: BigNumberish;
        validFrom?: number;
        validUntil?: number;
    }): BatchBuilder;
    /**
     * Sets transactions nonces, assembles the batch and constructs the message to be signed by user.
     */
    private processTransactions;
}
