# AzureDeploy template

## PowerShell Script

Manual deployment using Powershell:

### development

Create the storage environment for webapplication front end data this will clean off any other deployed objects such as the containers

```Powershell
Login-AzureRmAccount

$param = @{ }
New-AzureRmResourceGroupDeployment -ResourceGroupName "healthbank-eud1" -TemplateFile ".\azuredeploy.json" -TemplateParameterObject $param -Mode Complete
```

Create the nginx configuration for development

```Bash
cat nginx.conf | sed 's/<timeline-domain-name>/dev-identity.healthbank.me/g' > nginx.timeline.dev.healthbank.me.conf
```

Upload the file into the configuration share to be used below. Take the output of the PowerShell above into the configuration below. 

```PowerShell
Login-AzureRmAccount

$param = @{ 
    configurationShareAccountName="healthbank***";
    configurationShareAccountKey="Qb6***"; 
    configurationShareToUse="dev-healthbank-me"; 
    contentShareAccountName="7rtsr2a***";
    contentShareAccountKey="DVQ***"; 
    contentShareToUse="webapp";
}
New-AzureRmResourceGroupDeployment -ResourceGroupName "healthbank-eud1" -TemplateFile ".\azuredeploy.containers.json" -TemplateParameterObject $param -Mode Incremental
```

### staging


### production Europe 1


**Note** the azuredeploy.json file and the pfx must be available locally.
