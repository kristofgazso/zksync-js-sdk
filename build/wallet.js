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
exports.submitSignedTransactionsBatch = exports.submitSignedTransaction = exports.Transaction = exports.ETHOperation = exports.Wallet = exports.ZKSyncTxError = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("@ethersproject/logger");
const eth_message_signer_1 = require("./eth-message-signer");
const signer_1 = require("./signer");
const batch_builder_1 = require("./batch-builder");
const utils_1 = require("./utils");
const EthersErrorCode = logger_1.ErrorCode;
class ZKSyncTxError extends Error {
    constructor(message, value) {
        super(message);
        this.value = value;
    }
}
exports.ZKSyncTxError = ZKSyncTxError;
class Wallet {
    constructor(ethSigner, ethMessageSigner, cachedAddress, signer, accountId, ethSignerType) {
        this.ethSigner = ethSigner;
        this.ethMessageSigner = ethMessageSigner;
        this.cachedAddress = cachedAddress;
        this.signer = signer;
        this.accountId = accountId;
        this.ethSignerType = ethSignerType;
    }
    connect(provider) {
        this.provider = provider;
        return this;
    }
    static fromEthSigner(ethWallet, provider, signer, accountId, ethSignerType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (signer == null) {
                const signerResult = yield signer_1.Signer.fromETHSignature(ethWallet);
                signer = signerResult.signer;
                ethSignerType = ethSignerType || signerResult.ethSignatureType;
            }
            else if (ethSignerType == null) {
                throw new Error('If you passed signer, you must also pass ethSignerType.');
            }
            const ethMessageSigner = new eth_message_signer_1.EthMessageSigner(ethWallet, ethSignerType);
            const wallet = new Wallet(ethWallet, ethMessageSigner, yield ethWallet.getAddress(), signer, accountId, ethSignerType);
            wallet.connect(provider);
            return wallet;
        });
    }
    static fromCreate2Data(syncSigner, provider, create2Data, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const create2Signer = new signer_1.Create2WalletSigner(yield syncSigner.pubKeyHash(), create2Data);
            return yield Wallet.fromEthSigner(create2Signer, provider, syncSigner, accountId, {
                verificationMethod: 'ERC-1271',
                isSignedMsgPrefixed: true
            });
        });
    }
    static fromEthSignerNoKeys(ethWallet, provider, accountId, ethSignerType) {
        return __awaiter(this, void 0, void 0, function* () {
            const ethMessageSigner = new eth_message_signer_1.EthMessageSigner(ethWallet, ethSignerType);
            const wallet = new Wallet(ethWallet, ethMessageSigner, yield ethWallet.getAddress(), undefined, accountId, ethSignerType);
            wallet.connect(provider);
            return wallet;
        });
    }
    getEthMessageSignature(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ethSignerType == null) {
                throw new Error('ethSignerType is unknown');
            }
            const signedBytes = utils_1.getSignedBytesFromMessage(message, !this.ethSignerType.isSignedMsgPrefixed);
            const signature = yield utils_1.signMessagePersonalAPI(this.ethSigner, signedBytes);
            return {
                type: this.ethSignerType.verificationMethod === 'ECDSA' ? 'EthereumSignature' : 'EIP1271Signature',
                signature
            };
        });
    }
    batchBuilder(nonce) {
        return batch_builder_1.BatchBuilder.fromWallet(this, nonce);
    }
    getTransfer(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for sending zksync transactions.');
            }
            yield this.setRequiredAccountIdFromServer('Transfer funds');
            const tokenId = this.provider.tokenSet.resolveTokenId(transfer.token);
            const transactionData = {
                accountId: this.accountId,
                from: this.address(),
                to: transfer.to,
                tokenId,
                amount: transfer.amount,
                fee: transfer.fee,
                nonce: transfer.nonce,
                validFrom: transfer.validFrom,
                validUntil: transfer.validUntil
            };
            return this.signer.signSyncTransfer(transactionData);
        });
    }
    signSyncTransfer(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            transfer.validFrom = transfer.validFrom || 0;
            transfer.validUntil = transfer.validUntil || utils_1.MAX_TIMESTAMP;
            const signedTransferTransaction = yield this.getTransfer(transfer);
            const stringAmount = ethers_1.BigNumber.from(transfer.amount).isZero()
                ? null
                : this.provider.tokenSet.formatToken(transfer.token, transfer.amount);
            const stringFee = ethers_1.BigNumber.from(transfer.fee).isZero()
                ? null
                : this.provider.tokenSet.formatToken(transfer.token, transfer.fee);
            const stringToken = this.provider.tokenSet.resolveTokenSymbol(transfer.token);
            const ethereumSignature = this.ethSigner instanceof signer_1.Create2WalletSigner
                ? null
                : yield this.ethMessageSigner.ethSignTransfer({
                    stringAmount,
                    stringFee,
                    stringToken,
                    to: transfer.to,
                    nonce: transfer.nonce,
                    accountId: this.accountId
                });
            return {
                tx: signedTransferTransaction,
                ethereumSignature
            };
        });
    }
    getForcedExit(forcedExit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for sending zksync transactions.');
            }
            yield this.setRequiredAccountIdFromServer('perform a Forced Exit');
            const tokenId = this.provider.tokenSet.resolveTokenId(forcedExit.token);
            const transactionData = {
                initiatorAccountId: this.accountId,
                target: forcedExit.target,
                tokenId,
                fee: forcedExit.fee,
                nonce: forcedExit.nonce,
                validFrom: forcedExit.validFrom || 0,
                validUntil: forcedExit.validUntil || utils_1.MAX_TIMESTAMP
            };
            return yield this.signer.signSyncForcedExit(transactionData);
        });
    }
    signSyncForcedExit(forcedExit) {
        return __awaiter(this, void 0, void 0, function* () {
            const signedForcedExitTransaction = yield this.getForcedExit(forcedExit);
            const stringFee = ethers_1.BigNumber.from(forcedExit.fee).isZero()
                ? null
                : this.provider.tokenSet.formatToken(forcedExit.token, forcedExit.fee);
            const stringToken = this.provider.tokenSet.resolveTokenSymbol(forcedExit.token);
            const ethereumSignature = this.ethSigner instanceof signer_1.Create2WalletSigner
                ? null
                : yield this.ethMessageSigner.ethSignForcedExit({
                    stringToken,
                    stringFee,
                    target: forcedExit.target,
                    nonce: forcedExit.nonce
                });
            return {
                tx: signedForcedExitTransaction,
                ethereumSignature
            };
        });
    }
    syncForcedExit(forcedExit) {
        return __awaiter(this, void 0, void 0, function* () {
            forcedExit.nonce = forcedExit.nonce != null ? yield this.getNonce(forcedExit.nonce) : yield this.getNonce();
            if (forcedExit.fee == null) {
                // Fee for forced exit is defined by `Withdraw` transaction type (as it's essentially just a forced withdraw).
                const fullFee = yield this.provider.getTransactionFee('Withdraw', forcedExit.target, forcedExit.token);
                forcedExit.fee = fullFee.totalFee;
            }
            const signedForcedExitTransaction = yield this.signSyncForcedExit(forcedExit);
            return submitSignedTransaction(signedForcedExitTransaction, this.provider);
        });
    }
    // Note that in syncMultiTransfer, unlike in syncTransfer,
    // users need to specify the fee for each transaction.
    // The main reason is that multitransfer enables paying fees
    // in multiple tokens, (as long as the total sum
    // of fees is enough to cover up the fees for all of the transactions).
    // That might bring an inattentive user in a trouble like the following:
    //
    // A user wants to submit transactions in multiple tokens and
    // wants to pay the fees with only some of them. If the user forgets
    // to set the fees' value to 0 for transactions with tokens
    // he won't pay the fee with, then this user will overpay a lot.
    //
    // That's why we want the users to be explicit about fees in multitransfers.
    syncMultiTransfer(transfers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for sending zksync transactions.');
            }
            if (transfers.length == 0)
                return [];
            yield this.setRequiredAccountIdFromServer('Transfer funds');
            let batch = [];
            let messages = [];
            let nextNonce = transfers[0].nonce != null ? yield this.getNonce(transfers[0].nonce) : yield this.getNonce();
            const batchNonce = nextNonce;
            for (let i = 0; i < transfers.length; i++) {
                const transfer = transfers[i];
                const nonce = nextNonce;
                nextNonce += 1;
                const tx = yield this.getTransfer({
                    to: transfer.to,
                    token: transfer.token,
                    amount: transfer.amount,
                    fee: transfer.fee,
                    nonce,
                    validFrom: transfer.validFrom || 0,
                    validUntil: transfer.validUntil || utils_1.MAX_TIMESTAMP
                });
                messages.push(this.getTransferEthMessagePart(transfer));
                batch.push({ tx, signature: null });
            }
            messages.push(`Nonce: ${batchNonce}`);
            const message = messages.filter((part) => part.length != 0).join('\n');
            const ethSignatures = this.ethSigner instanceof signer_1.Create2WalletSigner
                ? []
                : [yield this.ethMessageSigner.getEthMessageSignature(message)];
            const transactionHashes = yield this.provider.submitTxsBatch(batch, ethSignatures);
            return transactionHashes.map((txHash, idx) => new Transaction(batch[idx], txHash, this.provider));
        });
    }
    syncTransfer(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            transfer.nonce = transfer.nonce != null ? yield this.getNonce(transfer.nonce) : yield this.getNonce();
            if (transfer.fee == null) {
                const fullFee = yield this.provider.getTransactionFee('Transfer', transfer.to, transfer.token);
                transfer.fee = fullFee.totalFee;
            }
            const signedTransferTransaction = yield this.signSyncTransfer(transfer);
            return submitSignedTransaction(signedTransferTransaction, this.provider);
        });
    }
    getWithdrawFromSyncToEthereum(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for sending zksync transactions.');
            }
            yield this.setRequiredAccountIdFromServer('Withdraw funds');
            const tokenId = this.provider.tokenSet.resolveTokenId(withdraw.token);
            const transactionData = {
                accountId: this.accountId,
                from: this.address(),
                ethAddress: withdraw.ethAddress,
                tokenId,
                amount: withdraw.amount,
                fee: withdraw.fee,
                nonce: withdraw.nonce,
                validFrom: withdraw.validFrom,
                validUntil: withdraw.validUntil
            };
            return yield this.signer.signSyncWithdraw(transactionData);
        });
    }
    signWithdrawFromSyncToEthereum(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            withdraw.validFrom = withdraw.validFrom || 0;
            withdraw.validUntil = withdraw.validUntil || utils_1.MAX_TIMESTAMP;
            const signedWithdrawTransaction = yield this.getWithdrawFromSyncToEthereum(withdraw);
            const stringAmount = ethers_1.BigNumber.from(withdraw.amount).isZero()
                ? null
                : this.provider.tokenSet.formatToken(withdraw.token, withdraw.amount);
            const stringFee = ethers_1.BigNumber.from(withdraw.fee).isZero()
                ? null
                : this.provider.tokenSet.formatToken(withdraw.token, withdraw.fee);
            const stringToken = this.provider.tokenSet.resolveTokenSymbol(withdraw.token);
            const ethereumSignature = this.ethSigner instanceof signer_1.Create2WalletSigner
                ? null
                : yield this.ethMessageSigner.ethSignWithdraw({
                    stringAmount,
                    stringFee,
                    stringToken,
                    ethAddress: withdraw.ethAddress,
                    nonce: withdraw.nonce,
                    accountId: this.accountId
                });
            return {
                tx: signedWithdrawTransaction,
                ethereumSignature
            };
        });
    }
    withdrawFromSyncToEthereum(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            withdraw.nonce = withdraw.nonce != null ? yield this.getNonce(withdraw.nonce) : yield this.getNonce();
            if (withdraw.fee == null) {
                const feeType = withdraw.fastProcessing === true ? 'FastWithdraw' : 'Withdraw';
                const fullFee = yield this.provider.getTransactionFee(feeType, withdraw.ethAddress, withdraw.token);
                withdraw.fee = fullFee.totalFee;
            }
            const signedWithdrawTransaction = yield this.signWithdrawFromSyncToEthereum(withdraw);
            return submitSignedTransaction(signedWithdrawTransaction, this.provider, withdraw.fastProcessing);
        });
    }
    isSigningKeySet() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for current pubkey calculation.');
            }
            const currentPubKeyHash = yield this.getCurrentPubKeyHash();
            const signerPubKeyHash = yield this.signer.pubKeyHash();
            return currentPubKeyHash === signerPubKeyHash;
        });
    }
    getChangePubKey(changePubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for current pubkey calculation.');
            }
            const feeTokenId = this.provider.tokenSet.resolveTokenId(changePubKey.feeToken);
            const newPkHash = yield this.signer.pubKeyHash();
            yield this.setRequiredAccountIdFromServer('Set Signing Key');
            const changePubKeyTx = yield this.signer.signSyncChangePubKey({
                accountId: this.accountId,
                account: this.address(),
                newPkHash,
                nonce: changePubKey.nonce,
                feeTokenId,
                fee: ethers_1.BigNumber.from(changePubKey.fee).toString(),
                ethAuthData: changePubKey.ethAuthData,
                ethSignature: changePubKey.ethSignature,
                validFrom: changePubKey.validFrom,
                validUntil: changePubKey.validUntil
            });
            return changePubKeyTx;
        });
    }
    signSetSigningKey(changePubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPubKeyHash = yield this.signer.pubKeyHash();
            let ethAuthData;
            let ethSignature;
            if (changePubKey.ethAuthType === 'Onchain') {
                ethAuthData = {
                    type: 'Onchain'
                };
            }
            else if (changePubKey.ethAuthType === 'ECDSA') {
                yield this.setRequiredAccountIdFromServer('ChangePubKey authorized by ECDSA.');
                const changePubKeyMessage = utils_1.getChangePubkeyMessage(newPubKeyHash, changePubKey.nonce, this.accountId, changePubKey.batchHash);
                const ethSignature = (yield this.getEthMessageSignature(changePubKeyMessage)).signature;
                ethAuthData = {
                    type: 'ECDSA',
                    ethSignature,
                    batchHash: changePubKey.batchHash
                };
            }
            else if (changePubKey.ethAuthType === 'CREATE2') {
                if (this.ethSigner instanceof signer_1.Create2WalletSigner) {
                    const create2data = this.ethSigner.create2WalletData;
                    ethAuthData = {
                        type: 'CREATE2',
                        creatorAddress: create2data.creatorAddress,
                        saltArg: create2data.saltArg,
                        codeHash: create2data.codeHash
                    };
                }
                else {
                    throw new Error('CREATE2 wallet authentication is only available for CREATE2 wallets');
                }
            }
            else if (changePubKey.ethAuthType === 'ECDSALegacyMessage') {
                yield this.setRequiredAccountIdFromServer('ChangePubKey authorized by ECDSALegacyMessage.');
                const changePubKeyMessage = utils_1.getChangePubkeyLegacyMessage(newPubKeyHash, changePubKey.nonce, this.accountId);
                ethSignature = (yield this.getEthMessageSignature(changePubKeyMessage)).signature;
            }
            else {
                throw new Error('Unsupported SetSigningKey type');
            }
            const changePubkeyTxUnsigned = Object.assign(changePubKey, { ethAuthData, ethSignature });
            changePubkeyTxUnsigned.validFrom = changePubKey.validFrom || 0;
            changePubkeyTxUnsigned.validUntil = changePubKey.validUntil || utils_1.MAX_TIMESTAMP;
            const changePubKeyTx = yield this.getChangePubKey(changePubkeyTxUnsigned);
            return {
                tx: changePubKeyTx
            };
        });
    }
    setSigningKey(changePubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            changePubKey.nonce =
                changePubKey.nonce != null ? yield this.getNonce(changePubKey.nonce) : yield this.getNonce();
            if (changePubKey.fee == null) {
                changePubKey.fee = 0;
                if (changePubKey.ethAuthType === 'ECDSALegacyMessage') {
                    const feeType = {
                        ChangePubKey: {
                            onchainPubkeyAuth: true
                        }
                    };
                    const fullFee = yield this.provider.getTransactionFee(feeType, this.address(), changePubKey.feeToken);
                    changePubKey.fee = fullFee.totalFee;
                }
                else {
                    const feeType = {
                        ChangePubKey: changePubKey.ethAuthType
                    };
                    const fullFee = yield this.provider.getTransactionFee(feeType, this.address(), changePubKey.feeToken);
                    changePubKey.fee = fullFee.totalFee;
                }
            }
            const txData = yield this.signSetSigningKey(changePubKey);
            const currentPubKeyHash = yield this.getCurrentPubKeyHash();
            if (currentPubKeyHash === txData.tx.newPkHash) {
                throw new Error('Current signing key is already set');
            }
            return submitSignedTransaction(txData, this.provider);
        });
    }
    // The following methods are needed in case user decided to build
    // a message for the batch himself (e.g. in case of multi-authors batch).
    // It might seem that these belong to ethMessageSigner, however, we have
    // to resolve the token and format amount/fee before constructing the
    // transaction.
    getTransferEthMessagePart(transfer) {
        const stringAmount = ethers_1.BigNumber.from(transfer.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.amount);
        const stringFee = ethers_1.BigNumber.from(transfer.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(transfer.token);
        return this.ethMessageSigner.getTransferEthMessagePart({
            stringAmount,
            stringFee,
            stringToken,
            to: transfer.to
        });
    }
    getWithdrawEthMessagePart(withdraw) {
        const stringAmount = ethers_1.BigNumber.from(withdraw.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.amount);
        const stringFee = ethers_1.BigNumber.from(withdraw.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(withdraw.token);
        return this.ethMessageSigner.getWithdrawEthMessagePart({
            stringAmount,
            stringFee,
            stringToken,
            ethAddress: withdraw.ethAddress
        });
    }
    getChangePubKeyEthMessagePart(changePubKey) {
        const stringFee = ethers_1.BigNumber.from(changePubKey.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(changePubKey.feeToken, changePubKey.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(changePubKey.feeToken);
        return this.ethMessageSigner.getChangePubKeyEthMessagePart({
            pubKeyHash: changePubKey.pubKeyHash,
            stringToken,
            stringFee
        });
    }
    getForcedExitEthMessagePart(forcedExit) {
        const stringFee = ethers_1.BigNumber.from(forcedExit.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(forcedExit.token, forcedExit.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(forcedExit.token);
        return this.ethMessageSigner.getForcedExitEthMessagePart({
            stringToken,
            stringFee,
            target: forcedExit.target
        });
    }
    isOnchainAuthSigningKeySet(nonce = 'committed') {
        return __awaiter(this, void 0, void 0, function* () {
            const mainZkSyncContract = this.getZkSyncMainContract();
            const numNonce = yield this.getNonce(nonce);
            try {
                const onchainAuthFact = yield mainZkSyncContract.authFacts(this.address(), numNonce);
                return onchainAuthFact !== '0x0000000000000000000000000000000000000000000000000000000000000000';
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    onchainAuthSigningKey(nonce = 'committed', ethTxOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error('ZKSync signer is required for current pubkey calculation.');
            }
            const currentPubKeyHash = yield this.getCurrentPubKeyHash();
            const newPubKeyHash = yield this.signer.pubKeyHash();
            if (currentPubKeyHash === newPubKeyHash) {
                throw new Error('Current PubKeyHash is the same as new');
            }
            const numNonce = yield this.getNonce(nonce);
            const mainZkSyncContract = this.getZkSyncMainContract();
            try {
                return mainZkSyncContract.setAuthPubkeyHash(newPubKeyHash.replace('sync:', '0x'), numNonce, Object.assign({ gasLimit: ethers_1.BigNumber.from('200000') }, ethTxOptions));
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    getCurrentPubKeyHash() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.provider.getState(this.address())).committed.pubKeyHash;
        });
    }
    getNonce(nonce = 'committed') {
        return __awaiter(this, void 0, void 0, function* () {
            if (nonce === 'committed') {
                return (yield this.provider.getState(this.address())).committed.nonce;
            }
            else if (typeof nonce === 'number') {
                return nonce;
            }
        });
    }
    getAccountId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.provider.getState(this.address())).id;
        });
    }
    address() {
        return this.cachedAddress;
    }
    getAccountState() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.getState(this.address());
        });
    }
    getBalance(token, type = 'committed') {
        return __awaiter(this, void 0, void 0, function* () {
            const accountState = yield this.getAccountState();
            const tokenSymbol = this.provider.tokenSet.resolveTokenSymbol(token);
            let balance;
            if (type === 'committed') {
                balance = accountState.committed.balances[tokenSymbol] || '0';
            }
            else {
                balance = accountState.verified.balances[tokenSymbol] || '0';
            }
            return ethers_1.BigNumber.from(balance);
        });
    }
    getEthereumBalance(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return utils_1.getEthereumBalance(this.ethSigner.provider, this.provider, this.cachedAddress, token);
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    isERC20DepositsApproved(token, erc20ApproveThreshold = utils_1.ERC20_APPROVE_TRESHOLD) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utils_1.isTokenETH(token)) {
                throw Error('ETH token does not need approval.');
            }
            const tokenAddress = this.provider.tokenSet.resolveTokenAddress(token);
            const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner);
            try {
                const currentAllowance = yield erc20contract.allowance(this.address(), this.provider.contractAddress.mainContract);
                return ethers_1.BigNumber.from(currentAllowance).gte(erc20ApproveThreshold);
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    approveERC20TokenDeposits(token, max_erc20_approve_amount = utils_1.MAX_ERC20_APPROVE_AMOUNT) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utils_1.isTokenETH(token)) {
                throw Error('ETH token does not need approval.');
            }
            const tokenAddress = this.provider.tokenSet.resolveTokenAddress(token);
            const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner);
            try {
                return erc20contract.approve(this.provider.contractAddress.mainContract, max_erc20_approve_amount);
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    depositToSyncFromEthereum(deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasPrice = yield this.ethSigner.provider.getGasPrice();
            const mainZkSyncContract = this.getZkSyncMainContract();
            let ethTransaction;
            if (utils_1.isTokenETH(deposit.token)) {
                try {
                    ethTransaction = yield mainZkSyncContract.depositETH(deposit.depositTo, Object.assign({ value: ethers_1.BigNumber.from(deposit.amount), gasLimit: ethers_1.BigNumber.from(utils_1.ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT), gasPrice }, deposit.ethTxOptions));
                }
                catch (e) {
                    this.modifyEthersError(e);
                }
            }
            else {
                const tokenAddress = this.provider.tokenSet.resolveTokenAddress(deposit.token);
                // ERC20 token deposit
                const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner);
                let nonce;
                if (deposit.approveDepositAmountForERC20) {
                    try {
                        const approveTx = yield erc20contract.approve(this.provider.contractAddress.mainContract, deposit.amount);
                        nonce = approveTx.nonce + 1;
                    }
                    catch (e) {
                        this.modifyEthersError(e);
                    }
                }
                const args = [
                    tokenAddress,
                    deposit.amount,
                    deposit.depositTo,
                    Object.assign({ nonce,
                        gasPrice }, deposit.ethTxOptions)
                ];
                // We set gas limit only if user does not set it using ethTxOptions.
                const txRequest = args[args.length - 1];
                if (txRequest.gasLimit == null) {
                    try {
                        const gasEstimate = yield mainZkSyncContract.estimateGas.depositERC20(...args).then((estimate) => estimate, () => ethers_1.BigNumber.from('0'));
                        const isMainnet = (yield this.ethSigner.getChainId()) == 1;
                        let recommendedGasLimit = isMainnet && utils_1.ERC20_DEPOSIT_GAS_LIMIT[tokenAddress]
                            ? ethers_1.BigNumber.from(utils_1.ERC20_DEPOSIT_GAS_LIMIT[tokenAddress])
                            : utils_1.ERC20_RECOMMENDED_DEPOSIT_GAS_LIMIT;
                        txRequest.gasLimit = gasEstimate.gte(recommendedGasLimit) ? gasEstimate : recommendedGasLimit;
                        args[args.length - 1] = txRequest;
                    }
                    catch (e) {
                        this.modifyEthersError(e);
                    }
                }
                try {
                    ethTransaction = yield mainZkSyncContract.depositERC20(...args);
                }
                catch (e) {
                    this.modifyEthersError(e);
                }
            }
            return new ETHOperation(ethTransaction, this.provider);
        });
    }
    emergencyWithdraw(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasPrice = yield this.ethSigner.provider.getGasPrice();
            let accountId;
            if (withdraw.accountId != null) {
                accountId = withdraw.accountId;
            }
            else if (this.accountId !== undefined) {
                accountId = this.accountId;
            }
            else {
                const accountState = yield this.getAccountState();
                if (!accountState.id) {
                    throw new Error("Can't resolve account id from the zkSync node");
                }
                accountId = accountState.id;
            }
            const mainZkSyncContract = this.getZkSyncMainContract();
            const tokenAddress = this.provider.tokenSet.resolveTokenAddress(withdraw.token);
            try {
                const ethTransaction = yield mainZkSyncContract.requestFullExit(accountId, tokenAddress, Object.assign({ gasLimit: ethers_1.BigNumber.from('500000'), gasPrice }, withdraw.ethTxOptions));
                return new ETHOperation(ethTransaction, this.provider);
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        });
    }
    getZkSyncMainContract() {
        return new ethers_1.ethers.Contract(this.provider.contractAddress.mainContract, utils_1.SYNC_MAIN_CONTRACT_INTERFACE, this.ethSigner);
    }
    modifyEthersError(error) {
        if (this.ethSigner instanceof ethers_1.ethers.providers.JsonRpcSigner) {
            // List of errors that can be caused by user's actions, which have to be forwarded as-is.
            const correct_errors = [
                EthersErrorCode.NONCE_EXPIRED,
                EthersErrorCode.INSUFFICIENT_FUNDS,
                EthersErrorCode.REPLACEMENT_UNDERPRICED,
                EthersErrorCode.UNPREDICTABLE_GAS_LIMIT
            ];
            if (!correct_errors.includes(error.code)) {
                // This is an error which we don't expect
                error.message = `Ethereum smart wallet JSON RPC server returned the following error while executing an operation: "${error.message}". Please contact your smart wallet support for help.`;
            }
        }
        throw error;
    }
    setRequiredAccountIdFromServer(actionName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accountId === undefined) {
                const accountIdFromServer = yield this.getAccountId();
                if (accountIdFromServer == null) {
                    throw new Error(`Failed to ${actionName}: Account does not exist in the zkSync network`);
                }
                else {
                    this.accountId = accountIdFromServer;
                }
            }
        });
    }
}
exports.Wallet = Wallet;
class ETHOperation {
    constructor(ethTx, zkSyncProvider) {
        this.ethTx = ethTx;
        this.zkSyncProvider = zkSyncProvider;
        this.state = 'Sent';
    }
    awaitEthereumTxCommit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state !== 'Sent')
                return;
            const txReceipt = yield this.ethTx.wait();
            for (const log of txReceipt.logs) {
                try {
                    const priorityQueueLog = utils_1.SYNC_MAIN_CONTRACT_INTERFACE.parseLog(log);
                    if (priorityQueueLog && priorityQueueLog.args.serialId != null) {
                        this.priorityOpId = priorityQueueLog.args.serialId;
                    }
                }
                catch (_a) { }
            }
            if (!this.priorityOpId) {
                throw new Error('Failed to parse tx logs');
            }
            this.state = 'Mined';
            return txReceipt;
        });
    }
    awaitReceipt() {
        return __awaiter(this, void 0, void 0, function* () {
            this.throwErrorIfFailedState();
            yield this.awaitEthereumTxCommit();
            if (this.state !== 'Mined')
                return;
            const receipt = yield this.zkSyncProvider.notifyPriorityOp(this.priorityOpId.toNumber(), 'COMMIT');
            if (!receipt.executed) {
                this.setErrorState(new ZKSyncTxError('Priority operation failed', receipt));
                this.throwErrorIfFailedState();
            }
            this.state = 'Committed';
            return receipt;
        });
    }
    awaitVerifyReceipt() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.awaitReceipt();
            if (this.state !== 'Committed')
                return;
            const receipt = yield this.zkSyncProvider.notifyPriorityOp(this.priorityOpId.toNumber(), 'VERIFY');
            this.state = 'Verified';
            return receipt;
        });
    }
    setErrorState(error) {
        this.state = 'Failed';
        this.error = error;
    }
    throwErrorIfFailedState() {
        if (this.state === 'Failed')
            throw this.error;
    }
}
exports.ETHOperation = ETHOperation;
class Transaction {
    constructor(txData, txHash, sidechainProvider) {
        this.txData = txData;
        this.txHash = txHash;
        this.sidechainProvider = sidechainProvider;
        this.state = 'Sent';
    }
    awaitReceipt() {
        return __awaiter(this, void 0, void 0, function* () {
            this.throwErrorIfFailedState();
            if (this.state !== 'Sent')
                return;
            const receipt = yield this.sidechainProvider.notifyTransaction(this.txHash, 'COMMIT');
            if (!receipt.success) {
                this.setErrorState(new ZKSyncTxError(`zkSync transaction failed: ${receipt.failReason}`, receipt));
                this.throwErrorIfFailedState();
            }
            this.state = 'Committed';
            return receipt;
        });
    }
    awaitVerifyReceipt() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.awaitReceipt();
            const receipt = yield this.sidechainProvider.notifyTransaction(this.txHash, 'VERIFY');
            this.state = 'Verified';
            return receipt;
        });
    }
    setErrorState(error) {
        this.state = 'Failed';
        this.error = error;
    }
    throwErrorIfFailedState() {
        if (this.state === 'Failed')
            throw this.error;
    }
}
exports.Transaction = Transaction;
function submitSignedTransaction(signedTx, provider, fastProcessing) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionHash = yield provider.submitTx(signedTx.tx, signedTx.ethereumSignature, fastProcessing);
        return new Transaction(signedTx, transactionHash, provider);
    });
}
exports.submitSignedTransaction = submitSignedTransaction;
function submitSignedTransactionsBatch(provider, signedTxs, ethSignatures) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionHashes = yield provider.submitTxsBatch(signedTxs.map((tx) => {
            return { tx: tx.tx, signature: tx.ethereumSignature };
        }), ethSignatures);
        return transactionHashes.map((txHash, idx) => new Transaction(signedTxs[idx], txHash, provider));
    });
}
exports.submitSignedTransactionsBatch = submitSignedTransactionsBatch;
