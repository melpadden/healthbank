# healthbank timeline web frontend

This front-end is based on the Angular CLI [angular-cli](https://github.com/angular/angular-cli/).
_Important: not all `ng` cli commands should be used directly in this project, use the provided npm run scripts! Read on for details._ 

## Dependencies

Assure you have installed and configured
* Java JDK 8 (Oracle or OpenJDK is fine)
* Apache Maven

### Recommended: Install node and angular CLI globally

* Install Node.js LTS (it's best to use the version from the pom.xml (property `node.version`)
* `npm install -g @angular/cli` _(You might need to use `sudo` on Linux)_

## Setup

Make sure that maven is set up correctly:

1. Setup servers in .m2/settings.xml ()in the user directory):

    ```xml
    <settings>
    <servers>
        <server>
          <id>healthbank-visualstudio.com-healthbank</id>
          <configuration>
            <httpHeaders>
              <property>
                <name>Authorization</name>
                <value>{TODO: generate token or ask rs}</value>
              </property>
            </httpHeaders>
          </configuration>
        </server>
        
        <server>
            <id>rise</id>
            <username>{TODO: your rz01 username}</username>
            <password>{TODO: your rz01 password}</password>
        </server>
    </servers>
 
    <activeProfiles>
         <activeProfile>healthbank</activeProfile>
     </activeProfiles>
 
     <profiles>
         <profile>
             <id>healthbank</id>
             <repositories>
                 <repository>
                     <id>healthbank-visualstudio.com-healthbank</id>
                     <url>https://healthbank.pkgs.visualstudio.com/_packaging/healthbank/maven/v1</url>
                     <releases>
                         <enabled>true</enabled>
                     </releases>
                     <snapshots>
                     </snapshots>
                 </repository>
             </repositories>
             <pluginRepositories>
                 <pluginRepository>
                     <id>healthbank-visualstudio.com-healthbank</id>
                     <url>https://healthbank.pkgs.visualstudio.com/_packaging/healthbank/maven/v1</url>
                     <releases>
                         <enabled>true</enabled>
                     </releases>
                     <snapshots>
                         <enabled>true</enabled>
                     </snapshots>
                 </pluginRepository>
             </pluginRepositories>
         </profile>
    </profiles>
    </settings>
    ```
2. set environment variable MAVEN_OPTS:

    ```bash
    -Dfile.encoding=UTF-8
    ```

## Build

It's expected that all backend services are available via maven. This usually means running `mvn clean install` for all backend services.

Build and test everything. _This commands should be executed before committing._
````bash
mvn clean install -Pit,web
````

## Development

### dev server for live reload

````bash
npm start
````

open [http://localhost:4200](http://localhost:4200)

### continuous unit/integration testing (watch mode)

Make sure the backend is running.

````bash
ng test
````

### unit/integration tests

Make sure the backend is running.

````bash
npm test
````

### end-to-end tests

Make sure the backend is running.

````bash
npm run e2e
````

If you get complaints about "Webdrivers", try
```bash
node_modules/.bin/webdriver-manager update
```

Ensure everything is linted. This command contains the auto-fix option, which might require you to re-run the command.
````bash
npm run lint
````

### Maven Options

| mvn Parameter            | |
| ------------------------ | --- |
|-DskipTests               | Skips tests. |
|-Dfrontend.browser=Chrome | Change the used browser for IT tests. Values: Chrome, Firefox, PhantomJS (Karma only) |


### Accessing Assets

To access assets stored in the `assets` folder from the source or from an HTML template (not: SCSS, this is handled differently).
Be sure to use the configuration for the path like so:
```typescript
import { environment } from '../../../environments/environment';

@Component({
  template: `
    <img src="{{assets}}/images/RISE_logo.png">
  `
})
export class Component {
  assets = environment.assets;
}
```


### icon usage

We suggest to use icons as SVG-Sprites (Symbol references). We strongly recommend to use this app: `https://icomoon.io/app` 
to generate a new SVG-Sprite. Icomoon allows you to select icons from existing libraries e.g. **FontAwesome** or 
upload your own custom SVGs or combine both. As of the time writing Blueprints comes with Google's Material Icons.
[Browse icons](https://material.io/icons/) and concatenate names with an `_`. 

**To use the any svg icon:**

```html
<svg class="ma-icon-[symbol_name]" aria-hidden="true">
  <use attr.xlink:href="{{assets}}/images/symbol-defs.svg#ma-icon-[symbol_name]"></use>
</svg>
```

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.


### Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## Useful Commands

CLI Update:
1. Bootstrap a new project with following command

   `ng new ngcli --skip-install --style scss --inline-style --inline-template --routing --prefix app`

2. Diff the directory


## Troubleshooting

### Problems with watch and automatic updates
If you are using IntelliJ or Webstorm: https://webpack.github.io/docs/troubleshooting.html#file-saves-in-webstorm-don-t-trigger-the-watcher

### Mac: ng cli uses 100% cpu
A solution is, to localy install the `fsevents` package, but be sure not 
to save it to `package.json` as it will break the setup on e.g. windows.

``` bash
npm i --no-save fsevents
```
