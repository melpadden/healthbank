az container delete --resource-group "hbmeddev" --name "healthbank-eud1-mediplan" --yes
az group create --location westeurope --name hbmeddev --tags Solution="Development" Service="Mediplan"
az group deployment create --resource-group "hbmeddev" --mode Incremental --template-file ./azuredeploy.json --parameters serviceName=hbmeddev

