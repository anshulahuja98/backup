import * as core from '@actions/core';
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { BackupVaultClient, VaultClientBase } from "./BackupVaultClient";

import util = require("util");
import { VaultActionParameters } from './VaultActionParameters';
import { Console } from 'console';
import { resolve } from 'dns';



function isNullOrWhiteSpace(input: string) {
    return (typeof input === 'undefined' || input == null)
    || input.replace(/\s/g, '').length < 1;
}


export class VaultHelperFactory{
    public static  isNullOrWhitespace( input ) {
       
      }

    public static getVaultHelper(handler: IAuthorizer, timeOut: number, actionParams: VaultActionParameters): VaultHelper {
        if (!isNullOrWhiteSpace(actionParams.recoveryServicesVault)) {
            return new RecoveryServicesVaultHelper(handler, timeOut, actionParams );
        } else if (!isNullOrWhiteSpace(actionParams.backupVault)) {
            return new BackupVaultHelper(handler, timeOut, actionParams);
        }
        else{
            throw new Error("Invalid vault type");
        }
    }
}

interface VaultHelper{
    adhocBackup(backupInstanceNameList: string[]): Promise<void>
    listBackupInstances(): Promise<object>
    initVaultHelper(): Promise<void>
}

class VaultHelperBase implements VaultHelper{ 
    
    protected backupVaultActionParameters: VaultActionParameters;
    // private keyVaultClient: KeyVaultClient;
    protected timeOut: number;
    protected handler: IAuthorizer;

    constructor(handler: IAuthorizer, timeOut: number, backupVaultActionParameters: VaultActionParameters) {
        this.backupVaultActionParameters = backupVaultActionParameters;
        this.timeOut = timeOut;
        this.handler = handler;        
    }
    initVaultHelper(): Promise<void> {
        return;
    }
    adhocBackup(backupInstanceNameList: string[]): Promise<void> {
        return;
    }
    async listBackupInstances(): Promise<object> {
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
        this.vaultClient = new BackupVaultClient(this.handler, this.timeOut);
        await this.vaultClient.init();

    }
    adhocBackup(backupInstanceNameList: string[]): Promise<void> {
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
    async listBackupInstances(): Promise<object> {
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
     
    }
}

export class RecoveryServicesVaultHelper extends VaultHelperBase{
    private vaultHelper: BackupVaultClient;

    async initVaultHelper(): Promise<void>{
        await this.vaultHelper.init();
    }
    adhocBackup(backupInstanceNameList: string[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    listBackupInstances(): Promise<object> {
        throw new Error('Method not implemented.');
    }

}

