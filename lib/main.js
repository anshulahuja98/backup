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
const crypto = __importStar(require("crypto"));
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const VaultHelper_1 = require("./VaultHelper");
const VaultActionParameters_1 = require("./VaultActionParameters");
var azPath;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("Starting backup vault action");
        try {
            let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
            let actionName = 'GetKeyVaultSecrets';
            let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            let handler = null;
            let timeOut = 100;
            try {
                handler = yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
            }
            catch (error) {
                core.setFailed("Could not login to Azure.");
            }
            if (handler != null) {
                core.info("logged into azure");
                var backupType = core.getInput('action').toLowerCase();
                var backupVaultActionParameters = new VaultActionParameters_1.VaultActionParameters().getBackupActionParameters(handler);
                // TODO remove
                backupType = "vaultlevelbackup";
                backupVaultActionParameters.backupVault = "anshulaksvault";
                backupVaultActionParameters.resourceGroupName = "anshulaksvault";
                var vaultHelper = VaultHelper_1.VaultHelperFactory.getVaultHelper(handler, timeOut, backupVaultActionParameters);
                // if (backupType === "vaultlevelbackup"){
                yield vaultHelper.initVaultCient();
                var backupInstanceListObject = yield vaultHelper.listBackupInstances();
                var backupInstancesNameList = [];
                for (var instance in backupInstanceListObject) {
                    if (backupInstanceListObject[instance]["properties"]["currentProtectionState"].toLowerCase() === "protectionconfigured") {
                        backupInstancesNameList.push(backupInstanceListObject[instance]["name"]);
                        core.info(backupInstanceListObject[instance]["name"] + " is a properly configured backup instance");
                    }
                    else {
                        core.warning(backupInstanceListObject[instance]["name"] + " CurrentProtectionState:" + backupInstanceListObject[instance]["properties"]["currentProtectionState"] + " is a not a properly configured backup instance, skipping it");
                    }
                }
                vaultHelper.adhocBackup(backupInstancesNameList);
                // vaultHelper.adhocBackup();
                // }                        
            }
        }
        catch (error) {
            core.debug("Get secret failed with error: " + error);
            core.setFailed(!!error.message ? error.message : "Error occurred in fetching the secrets.");
        }
        finally {
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        }
    });
}
run();
