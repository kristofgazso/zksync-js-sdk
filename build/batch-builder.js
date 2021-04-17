"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchBuilder = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
/**
 * Provides iterface for constructing batches of transactions.
 */
class BatchBuilder {
    constructor(wallet, nonce, txs = []) {
        this.wallet = wallet;
        this.nonce = nonce;
        this.txs = txs;
    }
    static fromWallet(wallet, nonce) {
        const batchBuilder = new BatchBuilder(wallet, nonce, []);
        return batchBuilder;
    }
    /**
     * Construct the batch from the given transactions.
     * Returs it with the corresponding Ethereum signature and total fee.
     * @param feeToken If provided, the fee for the whole batch will be obtained from the server in this token.
     * Possibly creates phantom transfer.
     */
    build(feeToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.txs.length == 0) {
                throw new Error('Transaction batch cannot be empty');
            }
            if (feeToken != undefined) {
                yield this.setFeeToken(feeToken);
            }
            // Gather total fee for every token.
            const totalFee = new Map();
            for (const tx of this.txs) {
                const fee = tx.tx.fee;
                // Signed transactions store token ids instead of symbols.
                if (tx.alreadySigned) {
                    tx.token = this.wallet.provider.tokenSet.resolveTokenSymbol(tx.tx.feeToken);
                }
                const token = tx.token;
                const curr = totalFee.get(token) || ethers_1.BigNumber.from(0);
                totalFee.set(token, curr.add(fee));
            }
            const { txs, message } = yield this.processTransactions();
            let signature = yield this.wallet.getEthMessageSignature(message);
            return {
                txs,
                signature,
                totalFee
            };
        });
    }
    setFeeToken(feeToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // If user specified a token he wants to pay with, we expect all fees to be zero
            // and no signed transactions in the batch.
            if (this.txs.find((tx) => tx.alreadySigned || !ethers_1.BigNumber.from(tx.tx.fee).isZero()) != undefined) {
                throw new Error('All transactions are expected to be unsigned with zero fees');
            }
            // We use the last transaction in the batch for paying fees.
            // If it uses different token, create dummy transfer to self.
            if (this.txs[this.txs.length - 1].token !== feeToken) {
                this.addTransfer({
                    to: this.wallet.address(),
                    token: feeToken,
                    amount: 0
                });
            }
            const txWithFeeToken = this.txs[this.txs.length - 1];
            const txTypes = this.txs.map((tx) => tx.feeType);
            const addresses = this.txs.map((tx) => tx.address);
            txWithFeeToken.tx.fee = yield this.wallet.provider.getTransactionsBatchFee(txTypes, addresses, feeToken);
        });
    }
    addWithdraw(withdraw) {
        const _withdraw = {
            ethAddress: withdraw.ethAddress,
            token: withdraw.token,
            amount: withdraw.amount,
            fee: withdraw.fee || 0,
            nonce: null,
            validFrom: withdraw.validFrom || 0,
            validUntil: withdraw.validUntil || utils_1.MAX_TIMESTAMP
        };
        const feeType = withdraw.fastProcessing === true ? 'FastWithdraw' : 'Withdraw';
        this.txs.push({
            type: 'Withdraw',
            tx: _withdraw,
            feeType: feeType,
            address: _withdraw.ethAddress,
            token: _withdraw.token
        });
        return this;
    }
    addTransfer(transfer) {
        const _transfer = {
            to: transfer.to,
            token: transfer.token,
            amount: transfer.amount,
            fee: transfer.fee || 0,
            nonce: null,
            validFrom: transfer.validFrom || 0,
            validUntil: transfer.validUntil || utils_1.MAX_TIMESTAMP
        };
        this.txs.push({
            type: 'Transfer',
            tx: _transfer,
            feeType: 'Transfer',
            address: _transfer.to,
            token: _transfer.token
        });
        return this;
    }
    addChangePubKey(changePubKey) {
        if ('tx' in changePubKey) {
            if (changePubKey.tx.type !== 'ChangePubKey') {
                throw new Error('Invalid transaction type: expected ChangePubKey');
            }
            // Already signed.
            this.txs.push({
                type: 'ChangePubKey',
                tx: changePubKey.tx,
                feeType: null,
                address: this.wallet.address(),
                token: null,
                alreadySigned: true
            });
            return this;
        }
        const _changePubKey = {
            feeToken: changePubKey.feeToken,
            fee: changePubKey.fee || 0,
            nonce: null,
            ethAuthType: changePubKey.ethAuthType,
            validFrom: changePubKey.validFrom || 0,
            validUntil: changePubKey.validUntil || utils_1.MAX_TIMESTAMP
        };
        const feeType = {
            ChangePubKey: changePubKey.ethAuthType
        };
        this.txs.push({
            type: 'ChangePubKey',
            tx: _changePubKey,
            feeType,
            address: this.wallet.address(),
            token: _changePubKey.feeToken
        });
        return this;
    }
    addForcedExit(forcedExit) {
        const _forcedExit = {
            target: forcedExit.target,
            token: forcedExit.token,
            fee: forcedExit.fee || 0,
            nonce: null,
            validFrom: forcedExit.validFrom || 0,
            validUntil: forcedExit.validUntil || utils_1.MAX_TIMESTAMP
        };
        this.txs.push({
            type: 'ForcedExit',
            tx: _forcedExit,
            feeType: 'Withdraw',
            address: _forcedExit.target,
            token: _forcedExit.token
        });
        return this;
    }
    /**
     * Sets transactions nonces, assembles the batch and constructs the message to be signed by user.
     */
    processTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const processedTxs = [];
            let messages = [];
            let nonce = yield this.wallet.getNonce(this.nonce);
            const batchNonce = nonce;
            for (const tx of this.txs) {
                tx.tx.nonce = nonce++;
                switch (tx.type) {
                    case 'Withdraw':
                        messages.push(this.wallet.getWithdrawEthMessagePart(tx.tx));
                        const withdraw = { tx: yield this.wallet.getWithdrawFromSyncToEthereum(tx.tx) };
                        processedTxs.push(withdraw);
                        break;
                    case 'Transfer':
                        messages.push(this.wallet.getTransferEthMessagePart(tx.tx));
                        const transfer = { tx: yield this.wallet.getTransfer(tx.tx) };
                        processedTxs.push(transfer);
                        break;
                    case 'ChangePubKey':
                        // ChangePubKey requires its own Ethereum signature, we either expect
                        // it to be signed already or do it here.
                        const changePubKey = tx.alreadySigned
                            ? tx.tx
                            : (yield this.wallet.signSetSigningKey(tx.tx)).tx;
                        const currentPubKeyHash = yield this.wallet.getCurrentPubKeyHash();
                        if (currentPubKeyHash === changePubKey.newPkHash) {
                            throw new Error('Current signing key is already set');
                        }
                        messages.push(this.wallet.getChangePubKeyEthMessagePart({
                            pubKeyHash: changePubKey.newPkHash,
                            feeToken: tx.token,
                            fee: changePubKey.fee
                        }));
                        processedTxs.push({ tx: changePubKey });
                        break;
                    case 'ForcedExit':
                        messages.push(this.wallet.getForcedExitEthMessagePart(tx.tx));
                        const forcedExit = { tx: yield this.wallet.getForcedExit(tx.tx) };
                        processedTxs.push(forcedExit);
                        break;
                }
            }
            messages.push(`Nonce: ${batchNonce}`);
            return {
                txs: processedTxs,
                message: messages.filter((part) => part.length != 0).join('\n')
            };
        });
    }
}
exports.BatchBuilder = BatchBuilder;
