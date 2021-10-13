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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const BackupVaultClient_1 = require("./BackupVaultClient");
function isNullOrWhiteSpace(input) {
    return (typeof input === 'undefined' || input == null)
        || input.replace(/\s/g, '').length < 1;
}
class VaultHelperFactory {
    static isNullOrWhitespace(input) {
    }
    static getVaultHelper(handler, timeOut, actionParams) {
        if (!isNullOrWhiteSpace(actionParams.recoveryServicesVault)) {
            return new RecoveryServicesVaultHelper(handler, timeOut, actionParams);
        }
        else if (!isNullOrWhiteSpace(actionParams.backupVault)) {
            return new BackupVaultHelper(handler, timeOut, actionParams);
        }
        else {
            throw new Error("Invalid vault type");
        }
    }
}
exports.VaultHelperFactory = VaultHelperFactory;
class VaultHelperBase {
    constructor(handler, timeOut, backupVaultActionParameters) {
        this.backupVaultActionParameters = backupVaultActionParameters;
        this.timeOut = timeOut;
        this.handler = handler;
    }
    initVaultHelper() {
        return;
    }
    adhocBackup(backupInstanceNameList) {
        return;
    }
    listBackupInstances() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    getError(error) {
        core.debug(JSON.stringify(error));
        if (error && error.message) {
            return error.message;
        }
        return error;
    }
}
class BackupVaultHelper extends VaultHelperBase {
    initVaultHelper() {
        return __awaiter(this, void 0, void 0, function* () {
            this.vaultClient = new BackupVaultClient_1.BackupVaultClient(this.handler, this.timeOut);
            yield this.vaultClient.init();
        });
    }
    adhocBackup(backupInstanceNameList) {
        return new Promise((resolve, reject) => {
            this.vaultClient.adhocBackup(this.backupVaultActionParameters.subscriptionId, this.backupVaultActionParameters.resourceGroupName, this.backupVaultActionParameters.backupVault, backupInstanceNameList, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    listBackupInstances() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.vaultClient.listBackupInstances(this.backupVaultActionParameters.subscriptionId, this.backupVaultActionParameters.resourceGroupName, this.backupVaultActionParameters.backupVault, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
}
exports.BackupVaultHelper = BackupVaultHelper;
class RecoveryServicesVaultHelper extends VaultHelperBase {
    initVaultHelper() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.vaultHelper.init();
        });
    }
    adhocBackup(backupInstanceNameList) {
        throw new Error('Method not implemented.');
    }
    listBackupInstances() {
        throw new Error('Method not implemented.');
    }
}
exports.RecoveryServicesVaultHelper = RecoveryServicesVaultHelper;
