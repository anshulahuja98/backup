# GitHub Action to Trigger Adhoc backup on Azure resources

With the Get Key Vault Secrets action, you can fetch secrets from an [Azure Key Vault](https://docs.microsoft.com/en-us/rest/api/keyvault/about-keys--secrets-and-certificates) instance and consume in your GitHub Action workflows.

Get started today with a [free Azure account](https://azure.com/free/open-source)!

The definition of this GitHub Action is in [action.yml](https://github.com/Azure/get-keyvault-secrets/blob/master/action.yml).

Secrets fetched will be set as [outputs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/metadata-syntax-for-github-actions#outputs) of the keyvault action instance and can be consumed in the subsequent actions in the workflow using the notation: `${{ steps.<Id-of-the-KeyVault-Action>.outputs.<Secret-Key> }}`. In addition, secrets are also set as environment variables. All the variables are automatically masked if printed to the console or to logs.

Refer to more [Actions for Azure](https://github.com/Azure/actions) and [Starter templates](https://github.com/Azure/actions-workflow-samples) to easily automate your CICD workflows targeting Azure services using GitHub Action workflows.

# End-to-End Sample Workflows

## Dependencies on other Github Actions

* Authenticate using [Azure Login](https://github.com/Azure/login) with an Azure service principal, which also has Get, List permissions on the keyvault under consideration.
  
### Sample workflow which leverages the Azure backup to periodically do a vault level backup Every Monday at 1PM UTC (9AM EST)

```yaml
# File: .github/workflows/workflow.yml

on:
  schedule:     
    # Every Monday at 1PM UTC (9AM EST)
    - cron: '0 13 * * 1'

jobs:
  trigger-backup:
      runs-on: ubuntu-latest
      steps:
        - name: Azure Login
          uses: azure/login@v1
          with:
            creds: ${{ secrets.AZURE_CREDENTIALS }}

        - name: Trigger Vault backup on Azure
          uses: anshulahuja98/backup@main
          with:
            resourcegroupname: myResourceGroup
            backupvault: myVault
            action: vaultlevelbackup
        
```

## Configure Azure credentials:

To fetch the credentials required to authenticate with Azure, run the following command to generate an Azure Service Principal (SPN) with Contributor permissions:

```sh
az ad sp create-for-rbac --name "myApp" --role contributor \
                            --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
                            --sdk-auth
                            
  # Replace {subscription-id}, {resource-group} with the subscription, resource group details of your keyvault

  # The command should output a JSON object similar to this:

  {
    "clientId": "<GUID>",
    "clientSecret": "<GUID>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    (...)
  }
```
Add the json output as [a secret](https://aka.ms/create-secrets-for-GitHub-workflows) (let's say with the name `AZURE_CREDENTIALS`) in the GitHub repository. 



## E2E scenario build -> test -> backup -> deploy

```yaml
# Controls when the workflow will run
on:
  # Triggers the workflow on push or pull request events but only for the main branch
  push:
    branches: [main]
  pull_request:
    branches: [main]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

name: Project build, test, backup, deploy

jobs:
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Run build command
        run: echo Hello, world!

      - name: Build project 
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.
  run-tests:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Run unit tests
        run: echo Hello, world!

      - name: Run E2E tests
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.
  trigger-backup:
    needs: run-tests
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Trigger Vault backup on Azure
        uses: anshulahuja98/backup@main
        with:
          resourcegroupname: anshulaksvault
          backupvault: anshulaksvault
          action: vaultlevelbackup
  
  deploy-to-azure:
    needs: trigger-backup
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Deploy Web app
        run: echo Hello, world!

      - name: Apply schema changes
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.
          
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

