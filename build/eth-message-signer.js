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
exports.EthMessageSigner = void 0;
const utils_1 = require("./utils");
/**
 * Wrapper around `ethers.Signer` which provides convenient methods to get and sign messages required for zkSync.
 */
class EthMessageSigner {
    constructor(ethSigner, ethSignerType) {
        this.ethSigner = ethSigner;
        this.ethSignerType = ethSignerType;
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
    getTransferEthSignMessage(transfer) {
        let humanReadableTxInfo = this.getTransferEthMessagePart(transfer);
        if (humanReadableTxInfo.length != 0) {
            humanReadableTxInfo += '\n';
        }
        humanReadableTxInfo += `Nonce: ${transfer.nonce}`;
        return humanReadableTxInfo;
    }
    ethSignTransfer(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.getTransferEthSignMessage(transfer);
            return yield this.getEthMessageSignature(message);
        });
    }
    ethSignForcedExit(forcedExit) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.getForcedExitEthSignMessage(forcedExit);
            return yield this.getEthMessageSignature(message);
        });
    }
    getWithdrawEthSignMessage(withdraw) {
        let humanReadableTxInfo = this.getWithdrawEthMessagePart(withdraw);
        if (humanReadableTxInfo.length != 0) {
            humanReadableTxInfo += '\n';
        }
        humanReadableTxInfo += `Nonce: ${withdraw.nonce}`;
        return humanReadableTxInfo;
    }
    getForcedExitEthSignMessage(forcedExit) {
        let humanReadableTxInfo = this.getForcedExitEthMessagePart(forcedExit);
        humanReadableTxInfo += `\nNonce: ${forcedExit.nonce}`;
        return humanReadableTxInfo;
    }
    getTransferEthMessagePart(tx) {
        let txType, to;
        if (tx.ethAddress != undefined) {
            txType = 'Withdraw';
            to = tx.ethAddress;
        }
        else if (tx.to != undefined) {
            txType = 'Transfer';
            to = tx.to;
        }
        else {
            throw new Error('Either to or ethAddress field must be present');
        }
        let message = '';
        if (tx.stringAmount != null) {
            message += `${txType} ${tx.stringAmount} ${tx.stringToken} to: ${to.toLowerCase()}`;
        }
        if (tx.stringFee != null) {
            if (message.length != 0) {
                message += '\n';
            }
            message += `Fee: ${tx.stringFee} ${tx.stringToken}`;
        }
        return message;
    }
    getWithdrawEthMessagePart(tx) {
        return this.getTransferEthMessagePart(tx);
    }
    getChangePubKeyEthMessagePart(changePubKey) {
        let message = '';
        message += `Set signing key: ${changePubKey.pubKeyHash.replace('sync:', '').toLowerCase()}`;
        if (changePubKey.stringFee != null) {
            message += `\nFee: ${changePubKey.stringFee} ${changePubKey.stringToken}`;
        }
        return message;
    }
    getForcedExitEthMessagePart(forcedExit) {
        let message = `ForcedExit ${forcedExit.stringToken} to: ${forcedExit.target.toLowerCase()}`;
        if (forcedExit.stringFee != null) {
            message += `\nFee: ${forcedExit.stringFee} ${forcedExit.stringToken}`;
        }
        return message;
    }
    ethSignWithdraw(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.getWithdrawEthSignMessage(withdraw);
            return yield this.getEthMessageSignature(message);
        });
    }
    getChangePubKeyEthSignMessage(changePubKey) {
        return utils_1.getChangePubkeyMessage(changePubKey.pubKeyHash, changePubKey.nonce, changePubKey.accountId);
    }
    ethSignChangePubKey(changePubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.getChangePubKeyEthSignMessage(changePubKey);
            return yield this.getEthMessageSignature(message);
        });
    }
}
exports.EthMessageSigner = EthMessageSigner;
