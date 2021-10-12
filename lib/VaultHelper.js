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
class VaultHelperFactory {
    static getVaultHelper(handler, timeOut, actionParams) {
        if (!actionParams.recoveryServicesVault) {
            return new RecoveryServicesVaultHelper(handler, timeOut, actionParams);
        }
        else if (!actionParams.backupVault) {
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
    adhocBackup() {
        return;
    }
    listBackupInstances() {
        return;
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
            yield this.vaultClient.init();
        });
    }
    adhocBackup() {
        throw new Error('Method not implemented.');
    }
    listBackupInstances() {
        this.vaultClient.listBackupInstances(this.backupVaultActionParameters.subscriptionId, this.backupVaultActionParameters.resourceGroupName, this.backupVaultActionParameters.backupVault, (error, listOfBackupInstances) => {
        });
        return;
    }
}
exports.BackupVaultHelper = BackupVaultHelper;
class RecoveryServicesVaultHelper extends VaultHelperBase {
    initVaultHelper() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.vaultHelper.init();
        });
    }
    adhocBackup() {
        throw new Error('Method not implemented.');
    }
    listBackupInstances() {
        throw new Error('Method not implemented.');
    }
}
exports.RecoveryServicesVaultHelper = RecoveryServicesVaultHelper;
