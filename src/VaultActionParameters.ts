import util = require("util");
import * as core from '@actions/core';
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';

export class VaultActionParameters {

    public subscriptionId: string;
    public resourceGroupName: string;
    public backupVault: string;
    public recoveryServicesVault: string;
    public selectedBackupInstances: string;

    public getBackupActionParameters(handler: IAuthorizer): VaultActionParameters {
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