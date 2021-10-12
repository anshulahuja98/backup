import * as core from '@actions/core';
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { BackupVaultClient } from "./BackupVaultClient";

import util = require("util");
import { VaultActionParameters } from './VaultActionParameters';


export class VaultHelperFactory{
    public static getVaultHelper(handler: IAuthorizer, timeOut: number, actionParams: VaultActionParameters): VaultHelper {
        if (!actionParams.recoveryServicesVault) {
            return new RecoveryServicesVaultHelper(handler, timeOut, actionParams );
        } else if (!actionParams.backupVault) {
            return new BackupVaultHelper(handler, timeOut, actionParams);
        }
        else{
            throw new Error("Invalid vault type");
        }
    }
}

interface VaultHelper{
    adhocBackup(): Promise<void>
    listBackupInstances(): Promise<void>
    initVaultHelper(): Promise<void>
}

class VaultHelperBase implements VaultHelper{ 
    
    public backupVaultActionParameters: VaultActionParameters;
    // private keyVaultClient: KeyVaultClient;
    private timeOut: number;
    private handler: IAuthorizer;

    constructor(handler: IAuthorizer, timeOut: number, backupVaultActionParameters: VaultActionParameters) {
        this.backupVaultActionParameters = backupVaultActionParameters;
        this.timeOut = timeOut;
        this.handler = handler;        
    }
    initVaultHelper(): Promise<void> {
        return;
    }
    adhocBackup(): Promise<void> {
        return;
    }
    listBackupInstances(): Promise<void> {
        return;
    }
    
    private getError(error: any): any {
        core.debug(JSON.stringify(error));

        if (error && error.message) {
            return error.message;
        }

        return error;
    }
}

export class BackupVaultHelper extends VaultHelperBase{


    private vaultClient: BackupVaultClient;

    async initVaultHelper() : Promise<void>{
        await this.vaultClient.init();

    }
    adhocBackup(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    listBackupInstances(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}

export class RecoveryServicesVaultHelper extends VaultHelperBase{
    private vaultHelper: BackupVaultClient;

    async initVaultHelper(): Promise<void>{
        await this.vaultHelper.init();
    }
    adhocBackup(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    listBackupInstances(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
