# azure-demeteorizer v0.2.0 (Alpha)
CLI tool for deploying demeteorized [meteor] apps on Azure App Service.

## Installation

NOTE: Windows only! While the CLI may work on Linux/Mac, the native modules Meteor requires must be compiled on a Windows machine for it to deploy successfuly on Azure. There is some investigation to moving this install process to Azure.

Meteor requires node v0.10.40 32bit to work. Check out [nvm] for a good tool to manage your node versions.

`npm install christopheranderson/azure-demeteorizer`

*Using GitHub has the install source is temporary until the package reaches "beta"*

## Prerequisites

1. Install Meteor locally (>v0.8.1)- [Install from Meteor.com][meteor]
2. Node v0.10.40 32bit - [Use nvm to make node version manage easy][nvm]
3. Mongo accessibly to Azure - i.e. [MongoDB](https://www.mongodb.com/) on a VM or [Mongo Lab](https://mongolab.com/)
4. App Service App with following App Settings:
    * MONGO_URL - (Mongo DB connection string from a MongoDB hosted on Mongo Lab or a VM)
    * ROOT_URL - http://{sitename}.azurewebsites.net or your custom domain if you've set that up
    * WEBSITE_NODE_DEFAULT_VERSION - 0.10.40    
5. Python 2.7 - Required for node-gyp
6. Microsoft Visual C++ Redistributable (2010 or greater)
    * It may be required to configure npm to use a newer version of C++ if you don't have 2010 installed.

If you have any issues during the install phase, it's likely that you are either using the wrong node version or don't have the prerequisites installed. Please review the requirements on [node-gyp](https://github.com/nodejs/node-gyp#installation)'s github page for Windows users.

If you have any issues after you've deployed, it's likely your node version is incorrect on the server.

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

## Additional options and tips

### Deployment fails

A couple of issues may arise while deploying:

1. Credentials aren't working
 - Go to the Azure Portal and reset your deployment credentials via any Web App. If you're still getting failures, turn local git deployment on and off. If you're still failing, open an issue.
2. 500 Error during deployment - can't delete `fibers.node`
 - Fibers is currently locked by the node process. There is currently some work in progress to fix this, but the work around is to stop your site via the Azure Portal before deploying, and starting it again after deploying.

### Custom web.config

There are lots of good reasons to need a custom web.config, for instance, 
[forcing HTTPS](http://microsoftazurewebsitescheatsheet.info/#force-https) 
or redirecting to your custom domain.

To use a custom web.config, just pass the path during the install phase. Like so: `azure-demeteorizer install -p ./path/to/web.config`

### Add .demeteorized to your .gitignore

If you add `.demeteorized` to your `.gitignore` (if you're using git), you can prevent the tool output from affecting your repository.

## Why is there a CLI tool for this?

[Meteor][meteor] is a popular JavaScript App Platform. It's something Azure App Service had a lot of requests for on the [Azure feedback site][azure feedback meteor request]. 
Azure App Serivce doesn't have explicit support for meteor apps, but it does have support for node applications, which is what meteor is built around. [Demeteorizer] is an 
open source, community supported tool designed to unpackage meteor apps into a regular node app. This CLI tool wraps Demeteorizer and makes the steps to deploy to Azure very simple.


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
