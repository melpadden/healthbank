# Deployment

This service is meant to be deployed as Docker container running on a Linux host.  

The Dockerfile with the build definition is located in `Dockerfile`.

# Configuration

The container uses NGINX to serve static files. In order to support different runtime configurations, a custom startup script is used. This script will use environment variables to prepare a file `env-settings.json` that the running client on the browser then will load.

## Relevant configuration parameters

|Environment variable|Description|Default value|
| --- | --- | --- |
|TIMELINE_API_HOST|URL endpoint for the timeline service|https://healthbank-eu-timeline.azurewebsites.net|
|IDENTITY_API_HOST|URL endpoint for the identity service (this is currently served by the timeline service)|https://healthbank-eu-timeline.azurewebsites.net|

TODO: split timeline and identity

# Stages

## Development

    TIMELINE_API_HOST=https://timeline.dev.healthbank.me
    IDENTITY_API_HOST=https://identity.dev.healthbank.me

## Staging

    TIMELINE_API_HOST=https://timeline.staging.healthbank.me
    IDENTITY_API_HOST=https://identity.staging.healthbank.me

## Production

    
