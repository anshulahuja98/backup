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
const AzureRestClient_1 = require("azure-actions-webclient/AzureRestClient");
class VaultClientBase extends AzureRestClient_1.ServiceClient {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    listBackupInstances(subscriptionID, resourceGroupName, vaultName, callback) {
        return;
    }
    adhocBackup(subscriptionID, resourceGroupName, vaultName, backupInstanceNameList, callback) {
        return;
    }
    invokeRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield this.beginRequest(request);
                return response;
            }
            catch (exception) {
                throw exception;
            }
        });
    }
}
exports.VaultClientBase = VaultClientBase;
class BackupVaultClient extends VaultClientBase {
    constructor() {
        super(...arguments);
        this.apiVersion = "api-version=2021-01-01";
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authHandler.getToken(true);
        });
    }
    adhocBackup(subscriptionID, resourceGroupName, vaultName, backupInstanceNameList, callback) {
        if (!callback) {
            core.debug("Callback Cannot Be Null");
            throw new Error("Callback Cannot Be Null");
        }
        backupInstanceNameList.forEach(backupInstanceName => {
            // Create HTTP transport objects
            var httpRequest = {
                method: 'POST',
                headers: {},
                uri: `https://management.azure.com/subscriptions/${subscriptionID}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataProtection/backupVaults/${vaultName}/backupInstances/${backupInstanceName}/Backup?${this.apiVersion}`,
                body: JSON.stringify({ "objectType": "TriggerBackupRequest", "backupRuleOptions": { "ruleName": "BackupDaily", "triggerOption": { "type": "AdhocBackupTriggerOption", "retentionTagOverRide": "Default" } } })
            };
            this.invokeRequest(httpRequest).then((response) => __awaiter(this, void 0, void 0, function* () {
                if (response.statusCode == 202) {
                    core.info(`Backup Started, for backup instance ${backupInstanceName}`);
                    var result = response.body.value;
                    return new AzureRestClient_1.ApiResult(null, result);
                }
                if (response.statusCode == 200) {
                    var result = response.body.value;
                    return new AzureRestClient_1.ApiResult(null, result);
                }
                else if (response.statusCode == 400) {
                    return new AzureRestClient_1.ApiResult('adhocBackup failed Because Of Invalid Characters');
                }
                else {
                    return new AzureRestClient_1.ApiResult(AzureRestClient_1.ToError(response));
                }
            })).then((apiResult) => callback(apiResult.error, apiResult.result), (error) => callback(error));
        });
    }
    ;
    listBackupInstances(subscriptionID, resourceGroupName, vaultName, callback) {
        if (!callback) {
            core.debug("Callback Cannot Be Null");
            throw new Error("Callback Cannot Be Null");
        }
        // Create HTTP transport objects
        var httpRequest = {
            method: 'GET',
            headers: {},
            uri: `https://management.azure.com/subscriptions/${subscriptionID}/resourceGroups/${resourceGroupName}/providers/Microsoft.DataProtection/backupVaults/${vaultName}/backupInstances?${this.apiVersion}`
        };
        this.invokeRequest(httpRequest).then((response) => __awaiter(this, void 0, void 0, function* () {
            if (response.statusCode == 200) {
                var result = response.body.value;
                return new AzureRestClient_1.ApiResult(null, result);
            }
            else if (response.statusCode == 400) {
                return new AzureRestClient_1.ApiResult('List Backup instances failed Because Of Invalid Characters');
            }
            else {
                return new AzureRestClient_1.ApiResult(AzureRestClient_1.ToError(response));
            }
        })).then((apiResult) => callback(apiResult.error, apiResult.result), (error) => callback(error));
    }
}
exports.BackupVaultClient = BackupVaultClient;
