import * as core from '@actions/core';
import * as crypto from "crypto";
import { AuthorizerFactory } from 'azure-actions-webclient/AuthorizerFactory';
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { BackupVaultHelper, VaultHelperFactory } from './VaultHelper';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { VaultActionParameters } from './VaultActionParameters';

var azPath: string;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
async function run() {
    core.info("Starting backup vault action");
    try {
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'GetKeyVaultSecrets';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

        let handler: IAuthorizer = null;
        let timeOut: number = 100;

        try {
            handler = await AuthorizerFactory.getAuthorizer();
        }
        catch (error) {
            core.setFailed("Could not login to Azure.")
        }

        if (handler != null) {
            core.info("logged into azure")
            var backupType = core.getInput('action').toLowerCase();
            var backupVaultActionParameters = new VaultActionParameters().getBackupActionParameters(handler);             
            
            // TODO remove
            backupType = "vaultlevelbackup";
            backupVaultActionParameters.backupVault = "anshulaksvault"
            backupVaultActionParameters.resourceGroupName = "anshulaksvault"

            var vaultHelper = VaultHelperFactory.getVaultHelper(handler, timeOut , backupVaultActionParameters);

            // if (backupType === "vaultlevelbackup"){
                vaultHelper.initVaultHelper();
                var backupInstanceListObject = await vaultHelper.listBackupInstances();
                var backupInstancesNameList = [];
                for(var instance in backupInstanceListObject){
                    if(backupInstanceListObject[instance]["properties"]["currentProtectionState"].toLowerCase() === "protectionconfigured"){
                        backupInstancesNameList.push(backupInstanceListObject[instance]["name"]);
                        core.info(backupInstanceListObject[instance]["name"] + " is a properly configured backup instance");
                    }
                    else{
                        core.warning(backupInstanceListObject[instance]["name"] + " CurrentProtectionState:" +  backupInstanceListObject[instance]["properties"]["currentProtectionState"] + " is a not a properly configured backup instance, skipping it");
                    }

                }
                vaultHelper.adhocBackup(backupInstancesNameList);
                // vaultHelper.adhocBackup();
            // }                        
        }        
    } catch (error) {
        core.debug("Get secret failed with error: " + error);
        core.setFailed(!!error.message ? error.message : "Error occurred in fetching the secrets.");
    }
    finally {
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
    }
}
run();