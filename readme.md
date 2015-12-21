# azure-demeteorizer v0.1.0 (Alpha)
CLI tool for deploying demeteorized [meteor] apps on Azure App Service.

## Why is there a CLI tool for this?

[Meteor][meteor] is a popular JavaScript App Platform. It's something Azure App Service had a lot of requests for on the [Azure feedback site][azure feedback meteor request]. 
Azure App Serivce doesn't have explicit support for meteor apps, but it does have support for node applications, which is what meteor is built around. [Demeteorizer] is an 
open source, community supported tool designed to unpackage meteor apps into a regular node app. This CLI tool wraps Demeteorizer and makes the steps to deploy to Azure very simple.

## Installation

NOTE: Windows only! While the CLI may work on Linux/Mac, the native modules Meteor requires must be compiled on a Windows machine for it to deploy successfuly on Azure. There is some investigation to moving this install process to Azure.

Meteor requires node v0.10.40 32bit to work. Check out [nvm] for a good tool to manage your node versions.

`npm install christopheranderson/azure-demeteorizer`

*Using GitHub has the install source is temporary until the package reaches "beta"*

## Deploy to Azure

There are 4 commands needed to deploy to Azure

1. After installing the tool, navigate to the directory hosting your meteor app
2. `azure-demeteorizer build`
3. `azure-demeteorizer install`
4. `azure-demeteorizer zip`
5. `azure-demeteorizer deploy -s [sitename] -u [username] - p [password]`
    - sitename: the name of your App Service App.
    - username: username for your site's [deployment credentials].
    - password: password for your site's [deployment credentials].

You should now be able to navigate to your site ({sitename}.azurewebsites.net) and see your application deployed now.

## Future Plans

* Beta Release:
    * Tests
    * More configuration
    * Streamline commands
    * Yell at you when your App Service App is misconfigured (missing connection strings, etc.)
* Even more future:
    * Enable CI: Remove need to run this tool on local box - allow it to run in a deploy script.
    * Supprt Linux/Mac

## License

[MIT](LICENSE)

<!-- Links -->
[meteor]: https://www.meteor.com/
[azure feedback meteor request]: https://feedback.azure.com/forums/169385-web-apps-formerly-websites/suggestions/6848937-add-support-for-meteor-on-azure-websites
[Demeteorizer]: https://github.com/onmodulus/demeteorizer
[deployment credentials]: https://github.com/projectkudu/kudu/wiki/Deployment-credentials
[nvm]: https://github.com/coreybutler/nvm-windows