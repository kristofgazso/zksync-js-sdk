"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _privateKey;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Create2WalletSigner = exports.Signer = void 0;
const crypto_1 = require("./crypto");
const ethers_1 = require("ethers");
const utils = __importStar(require("./utils"));
class Signer {
    constructor(privKey) {
        _privateKey.set(this, void 0);
        __classPrivateFieldSet(this, _privateKey, privKey);
    }
    pubKeyHash() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield crypto_1.privateKeyToPubKeyHash(__classPrivateFieldGet(this, _privateKey));
        });
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    transferSignBytes(transfer) {
        return utils.serializeTransfer(Object.assign(Object.assign({}, transfer), { type: 'Transfer', token: transfer.tokenId }));
    }
    signSyncTransfer(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = Object.assign(Object.assign({}, transfer), { type: 'Transfer', token: transfer.tokenId });
            const msgBytes = utils.serializeTransfer(tx);
            const signature = yield crypto_1.signTransactionBytes(__classPrivateFieldGet(this, _privateKey), msgBytes);
            return Object.assign(Object.assign({}, tx), { amount: ethers_1.BigNumber.from(transfer.amount).toString(), fee: ethers_1.BigNumber.from(transfer.fee).toString(), signature });
        });
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    withdrawSignBytes(withdraw) {
        return utils.serializeWithdraw(Object.assign(Object.assign({}, withdraw), { type: 'Withdraw', to: withdraw.ethAddress, token: withdraw.tokenId }));
    }
    signSyncWithdraw(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = Object.assign(Object.assign({}, withdraw), { type: 'Withdraw', to: withdraw.ethAddress, token: withdraw.tokenId });
            const msgBytes = utils.serializeWithdraw(tx);
            const signature = yield crypto_1.signTransactionBytes(__classPrivateFieldGet(this, _privateKey), msgBytes);
            return Object.assign(Object.assign({}, tx), { amount: ethers_1.BigNumber.from(withdraw.amount).toString(), fee: ethers_1.BigNumber.from(withdraw.fee).toString(), signature });
        });
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    forcedExitSignBytes(forcedExit) {
        return utils.serializeForcedExit(Object.assign(Object.assign({}, forcedExit), { type: 'ForcedExit', token: forcedExit.tokenId }));
    }
    signSyncForcedExit(forcedExit) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = Object.assign(Object.assign({}, forcedExit), { type: 'ForcedExit', token: forcedExit.tokenId });
            const msgBytes = utils.serializeForcedExit(tx);
            const signature = yield crypto_1.signTransactionBytes(__classPrivateFieldGet(this, _privateKey), msgBytes);
            return Object.assign(Object.assign({}, tx), { fee: ethers_1.BigNumber.from(forcedExit.fee).toString(), signature });
        });
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    changePubKeySignBytes(changePubKey) {
        return utils.serializeChangePubKey(Object.assign(Object.assign({}, changePubKey), { type: 'ChangePubKey', feeToken: changePubKey.feeTokenId, 
            // this is not important for serialization
            ethAuthData: { type: 'Onchain' } }));
    }
    signSyncChangePubKey(changePubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = Object.assign(Object.assign({}, changePubKey), { type: 'ChangePubKey', feeToken: changePubKey.feeTokenId });
            const msgBytes = utils.serializeChangePubKey(tx);
            const signature = yield crypto_1.signTransactionBytes(__classPrivateFieldGet(this, _privateKey), msgBytes);
            return Object.assign(Object.assign({}, tx), { fee: ethers_1.BigNumber.from(changePubKey.fee).toString(), signature });
        });
    }
    static fromPrivateKey(pk) {
        return new Signer(pk);
    }
    static fromSeed(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Signer(yield crypto_1.privateKeyFromSeed(seed));
        });
    }
    static fromETHSignature(ethSigner) {
        return __awaiter(this, void 0, void 0, function* () {
            let chainID = 1;
            if (ethSigner.provider) {
                const network = yield ethSigner.provider.getNetwork();
                chainID = network.chainId;
            }
            let message = 'Access zkSync account.\n\nOnly sign this message for a trusted client!';
            if (chainID !== 1) {
                message += `\nChain ID: ${chainID}.`;
            }
            const signedBytes = utils.getSignedBytesFromMessage(message, false);
            const signature = yield utils.signMessagePersonalAPI(ethSigner, signedBytes);
            const address = yield ethSigner.getAddress();
            const ethSignatureType = yield utils.getEthSignatureType(ethSigner.provider, message, signature, address);
            const seed = ethers_1.ethers.utils.arrayify(signature);
            const signer = yield Signer.fromSeed(seed);
            return { signer, ethSignatureType };
        });
    }
}
exports.Signer = Signer;
_privateKey = new WeakMap();
class Create2WalletSigner extends ethers_1.ethers.Signer {
    constructor(zkSyncPubkeyHash, create2WalletData, provider) {
        super();
        this.zkSyncPubkeyHash = zkSyncPubkeyHash;
        this.create2WalletData = create2WalletData;
        Object.defineProperty(this, 'provider', {
            enumerable: true,
            value: provider,
            writable: false
        });
        const create2Info = utils.getCREATE2AddressAndSalt(zkSyncPubkeyHash, create2WalletData);
        this.address = create2Info.address;
        this.salt = create2Info.salt;
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.address;
        });
    }
    /**
     * This signer can't sign messages but we return zeroed signature bytes to comply with ethers API.
     */
    signMessage(_message) {
        return __awaiter(this, void 0, void 0, function* () {
            return ethers_1.ethers.utils.hexlify(new Uint8Array(65));
        });
    }
    signTransaction(_message) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Create2Wallet signer can't sign transactions");
        });
    }
    connect(provider) {
        return new Create2WalletSigner(this.zkSyncPubkeyHash, this.create2WalletData, provider);
    }
}
exports.Create2WalletSigner = Create2WalletSigner;
