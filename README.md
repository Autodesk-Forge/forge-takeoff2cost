# forge-acc.takeoff2cost

[![Node.js](https://img.shields.io/badge/Node.js-8.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-4.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)

[![BIM-360](https://img.shields.io/badge/BIM%20360-v1-green.svg)](http://developer.autodesk.com/)
[![Cost Management](https://img.shields.io/badge/Cost%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![Takeoff](https://img.shields.io/badge/Takeoff-v1%20beta-green.svg)](http://developer.autodesk.com/)

[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)


## Description
This sample demostrates displaying package information from ACC takeoff product, and caculate the budget based on the quantity of takeoff items and price which is stored in database.

The sample also provides the ability to import the generated budgets directly into ACC(BIM 360) Cost Management product.  

## Thumbnail
![thumbnail](/thumbnail.png)  

## Demonstration
[![https://youtu.be/X6mFX_yqhTI](http://img.youtube.com/vi/X6mFX_yqhTI/0.jpg)](https://youtu.be/X6mFX_yqhTI "Display and exchange BIM 360 cost information with CSV file")


## Live Demo
[https://acct-akeoff2cost.herokuapp.com/](https://acc-takeoff2cost.herokuapp.com/)


# Web App Setup

## Prerequisites

1. **Forge Account**: Learn how to create a Forge Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). 
2. **ACC(BIM 360) Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
3. **ACC(BIM 360) Cost Management**: Create BIM 360 project, activate Cost Management module, setup project to create **Budget Code Template** for Cost Management according to [the guide](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html)
4. **Node.js**: basic knowledge with [**Node.js**](https://nodejs.org/en/).
5. **JavaScript** basic knowledge with **jQuery**
6. **MongoDB**: noSQL database, learn more. Or use a online version via Mongo Altas (this is used on this sample)

For using this sample, you need an Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/forge/callback/oauth** as Callback URL. Finally take note of the **Client ID** and **Client Secret**.


## Running locally

Install [NodeJS](https://nodejs.org), version 8 or newer.

Clone this project or download it (this `nodejs` branch only). It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/Autodesk-Forge/forge.takeoff2cost

Install the required packages using `npm install`.

**MongoDB**

[MongoDB](https://www.mongodb.com) is a no-SQL database based on "documents", which stores JSON-like data. For testing purpouses, you can either use local or live. For cloud environment, try [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (offers a free tier). With MongoDB Atlas you can set up an account for free and create clustered instances, intructions:

1. Create an account on MongoDB Atlas.
2. Create a free version of cluster, use the default setting, but name it as `forgesample` for example.
3. Whitelist the IP address to access the database, [see this tutorial](https://docs.atlas.mongodb.com/security-whitelist/). If the sample is running on Heroku, you'll need to open to all (IP `0.0.0.0/0`). 
4. Create a new user to access the database, please keep the **user name** and **password** to be used in the following connection. 
5. At this point, you can click **Connect** button to check your **connection string** to the MongoDB cluster, the connection string should be in the form like 
`mongodb+srv://<username>:<password>@<clustername>-<njl8m>.mongodb.net`. 

Please set environment variable `OAUTH_DATABASE` with your url. [Learn more here](https://docs.mongodb.com/manual/reference/connection-string/)

There are several tools to view your database, [Robo 3T](https://robomongo.org/) (formerly Robomongo) is a free lightweight GUI that can be used. When it opens, follow instructions [here](https://www.datduh.com/blog/2017/7/26/how-to-connect-to-mongodb-atlas-using-robo-3t-robomongo) to connect to MongoDB Atlas.


**Environment variables**

Set the enviroment variables with your client ID & secret and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:

Mac OSX/Linux (Terminal)

    npm install
    export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    export FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    export FORGE_CALLBACK_URL=<<YOUR CALLBACK URL>>
    export OAUTH_DATABASE="mongodb+srv://<username>:<password>@<clustername>-<njl8m>.mongodb.net>>"

    npm start

Windows (use **Node.js command line** from Start menu)

    npm install
    set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    set FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    set FORGE_CALLBACK_URL=<<YOUR CALLBACK URL>>
    set OAUTH_DATABASE="mongodb+srv://<username>:<password>@<clustername>-<njl8m>.mongodb.net>>"

    npm start

## Using the app

Open the browser: [http://localhost:3000](http://localhost:3000). 

**Please watch the [Video](https://youtu.be/X6mFX_yqhTI) for the detail setup and usage, or follow the steps:**

- **Setup the app before using the App**
1. Make sure to [Create ACC(BIM360) project, activate Takeoff and Cost products, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html).
3. Make sure to [Create BIM360 project, activate Cost Management module, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html), a **Budget Code Template** must be created before adding or importing budget items.
4. Make sure to initialize the **Price Book** database, open **Price Book** dialog, set **Length of budget code** according to your definition for **Budget Code Template**(the digits length of your budget code), and click **Reset** button, it will create **Standard_Book**(database), **Price_Book**(collection), with a couple of predefined sample price items.


- **Operate with App after setup**
1. Select takeoff package under ACC project, it will generate the quantity info for each takeoff item, and calculate the budget based on the quantity and price which is stored in database as Price Book, then display you the result in table.
2. Clike `Send to ACC Cost`, it will import the generated budgets directly into BIM 360 Cost Management module.

## Deployment

To deploy this application to Heroku, the **Callback URL** for Forge must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for Forge.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Forge/forge.takeoff2cost)


## Limitation
- BIM 360 Cost Management module needs to be activated to use this App, due to the current limitation of BIM 360 API, user needs to activate **Cost Management** module, and create **Budget Code Template** in cost project setting manually. Please check [Create BIM360 project, activate Cost Management module, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html) for details.
- **Budget Code** is required to create a budget. 


## Known issues


## Tips & Tricks
- **Cannot see my BIM 360 projects**: Make sure to provision the Forge App Client ID within the BIM 360 Account, [learn more here](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). This requires the Account Admin permission.
- Currently, a random budget code with specified digits length will be automatically generated for each budget. 

## Troubleshooting
1. **Cannot see my BIM 360 projects**: Make sure to provision the Forge App Client ID within the BIM 360 Account, [learn more here](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). This requires the Account Admin permission.
 
## Further Reading
**Document**:
- This sample is based on [Learn Forge Tutorial](https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/tree/nodejs), please check details there about the basic framework if you are not familar. 
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [ACC(BIM 360) Takeoff API](https://forge.autodesk.com/en/docs/bim360/v1/overview/field-guide/cost-management/)
- [ACC(BIM 360) Cost Management API](https://forge.autodesk.com/en/docs/bim360/v1/overview/field-guide/cost-management/)
- [Create BIM360 project, activate Cost Management module, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html)

**Tutorials**:
- [View BIM 360 Models](http://learnforge.autodesk.io/#/tutorials/viewhubmodels)

**Blogs**:
- [Forge Blog](https://forge.autodesk.com/categories/bim-360-api)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

## License
This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by
Zhong Wu [@johnonsoftware](https://twitter.com/johnonsoftware), [Forge Partner Development](http://forge.autodesk.com)
