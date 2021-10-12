import * as core from '@actions/core';
import util = require("util");
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { WebRequest, WebResponse } from 'azure-actions-webclient/WebClient';
import { ServiceClient as AzureRestClient, ToError, AzureError, ApiCallback, ApiResult } from 'azure-actions-webclient/AzureRestClient'

class VaultClientBase extends AzureRestClient {
    protected authHandler: IAuthorizer;
    
    public async invokeRequest(request: WebRequest): Promise<WebResponse> {
        try {
            var response = await this.beginRequest(request, );
            return response;
        } catch(exception) {
            throw exception;
        }
    }    

}

export class BackupVaultClient extends VaultClientBase {        
    
    private apiVersion: string = "api-version=2021-01-01";
    
    public async init() {        
        await this.authHandler.getToken(true);
    }
    
    public listBackupInstances(subscriptionID: string, resourceGroupName: string, vaultName: string, callback: ApiCallback) {
        if (!callback) {
            core.debug("Callback Cannot Be Null");
            throw new Error("Callback Cannot Be Null");
        }

        // Create HTTP transport objects
        var httpRequest: WebRequest = {
            method: 'GET',
            headers: {},
            uri: `https://management.azure.com/subscriptions/${subscriptionID}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataProtection/backupVaults/${vaultName}/backupInstances?${this.apiVersion}`         
        };        

        this.invokeRequest(httpRequest).then(async (response: WebResponse) => {
            if (response.statusCode == 200) {
                var result = response.body.value;
                return new ApiResult(null, result);
            }
            else if (response.statusCode == 400) {
                return new ApiResult('List Backup instances failed Because Of Invalid Characters');
            }
            else {
                return new ApiResult(ToError(response));
            }
        }).then((apiResult: ApiResult) => callback(apiResult.error, apiResult.result),
            (error) => callback(error));
    }
}