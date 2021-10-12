"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
class VaultActionParameters {
    getBackupActionParameters(handler) {
        this.resourceGroupName = core.getInput('resourcegroupname');
        this.backupVault = core.getInput("backupvault");
        this.recoveryServicesVault = core.getInput("recoveryservicesvault");
        this.selectedBackupInstances = core.getInput("selectedbackupinstances");
        if (!this.resourceGroupName) {
            core.info("Resource group not provided");
        }
        if (!this.backupVault && !this.recoveryServicesVault) {
            core.setFailed("No vault name provided.");
        }
        if (this.backupVault && this.recoveryServicesVault) {
            core.setFailed("Both type of vault names provided, please select only one type of vault in one workflow");
        }
        if (!this.selectedBackupInstances) {
            core.info("Since no backup instances specified, will back up all instances in the given vault.");
        }
        this.subscriptionId = handler.subscriptionID;
        return this;
    }
}
exports.VaultActionParameters = VaultActionParameters;
