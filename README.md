# forge-acc.takeoff2cost

[![Node.js](https://img.shields.io/badge/Node.js-8.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-4.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)

[![ACC](https://img.shields.io/badge/ACC-v1-green.svg)](http://developer.autodesk.com/)
[![Cost Management](https://img.shields.io/badge/Cost%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![Takeoff](https://img.shields.io/badge/Takeoff-v1-green.svg)](http://developer.autodesk.com/)

[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)


## Description
This sample demostrates displaying package information from ACC takeoff product, and caculate the budget based on the quantity of takeoff items and price which is stored in database.

The sample also provides the ability to import the generated budgets directly into ACC Cost Management.  

## Thumbnail
![thumbnail](/thumbnail.png)  

## Demonstration


[![https://youtu.be/dkAdC8BMQRw](http://img.youtube.com/vi/dkAdC8BMQRw/0.jpg)](http://www.youtube.com/watch?v=dkAdC8BMQRw "Export Takeoff packages to Cost as budgets")

## Live Demo
[https://acc-takeoff2cost.herokuapp.com/](https://acc-takeoff2cost.herokuapp.com/)


# Web App Setup

## Prerequisites

1. **Forge Account**: Learn how to create a Forge Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). 
2. **ACC Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
3. **ACC Takeoff**: Create ACC project, activate Takeoff module, get started with Autodesk Takeoff according to [the guide](https://help.autodesk.com/view/TAKEOFF/ENU/?guid=Getting_Started_Takeoff)
4. **ACC Cost Management**: Create ACC project, activate Cost Management module, setup project to create **Budget Code Template** for Cost Management according to [the guide](https://help.autodesk.com/view/BUILD/ENU/?guid=Cost_Income_Settings)
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
`mongodb+srv://<username>:<password>@<clustername>-<njl8m>.mongodb.net`. Set environment variable `OAUTH_DATABASE` with your url in the following step. [Learn more here](https://docs.mongodb.com/manual/reference/connection-string/)
6. Create a database named **PriceBook**, a collection named **DinningRoom**, then according to your takeoff types, add a couple of price item in the format of:
{
    "Type": "Door",
    "Price": 836,
    "Unit": "nr"
}

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

Windows (use **PowerShell**)

    npm install
    $env:FORGE_CLIENT_ID="YOUR CLIENT ID FROM DEVELOPER PORTAL"
    $env:FORGE_CLIENT_SECRET="YOUR CLIENT SECRET"
    $env:FORGE_CALLBACK_URL="YOUR CALLBACK URL"
    $env:OAUTH_DATABASE="mongodb+srv://<username>:<password>@<clustername>-<njl8m>.mongodb.net>>"
    
    npm start

## Using the app

Open the browser: [http://localhost:3000](http://localhost:3000). 

**Please follow the steps to setup the app:**

1. Make sure to [Create ACC project, activate Takeoff and Cost products, setup project for Cost Management](https://help.autodesk.com/view/DOCS/ENU/?guid=Create_Project), a **Budget Code Template** must be created before adding or importing budget items.

2. Work with takeoff module, upload 3D models or 2D Sheets, create a couple of packages, takeoff types and takeoff items.

**Operate with App after setup, please watch the [Video](https://youtu.be/dkAdC8BMQRw) for the detail usage** 
1. Select takeoff package under ACC project, it will generate the quantity info for each takeoff item, and calculate the budget based on the quantity and price which is stored in database as Price Book, then display you the result in table.
2. Click `Send to ACC Cost`, it will import the generated budgets directly into ACC Cost Management module.

## Deployment

To deploy this application to Heroku, the **Callback URL** for Forge must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for Forge.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Forge/forge.takeoff2cost)


## Limitation
- Takeoff item of 2D Sheet is not supported to be viewed in browser currently. Only takeoff item of 3D model is supported.


## Tips & Tricks
- **Cannot see my ACC projects**: Make sure to provision the Forge App Client ID within the ACC Account to get access to document, ACC indeed uses BIM 360 Admin Settings, this requires the Account Admin permission.[learn more here](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 

- Only ACC projects are listed, BIM 360 projects are not supported.

- Before using the app, user needs to activate and setup takeoff service, upload 3D models or 2D Sheets, create a couple of packages, takeoff types and takeoff items.

- The sample requires a price database which is built based on MongoDB, you can create and configurate it according to the steps above, or you can use the default database for try.

- ACC Cost Management module needs to be activated to use this App, user needs to activate **Cost Management** module, and create **Budget Code Template** in cost project setting manually. Please check [Budget Settings](https://help.autodesk.com/view/BUILD/ENU/?guid=Cost_Income_Settings) for details.

- **Budget Code** is required to create a budget, currently, a random budget code with specified digits length will be automatically generated for each budget. 

 
## Further Reading
**Document**:
- This sample is based on [Learn Forge Tutorial](https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/tree/nodejs), please check details there about the basic framework if you are not familar. 
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [BIM 360 API](https://forge.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [ACC API](https://forge.autodesk.com/en/docs/acc/v1/overview/)
- [How to use ACC Takeoff](https://help.autodesk.com/view/TAKEOFF/ENU/?guid=Getting_Started_Takeoff)
- [How to use ACC Cost Management](https://help.autodesk.com/view/BUILD/ENU/?guid=Cost_Overview)


**Tutorials**:
- [View ACC or BIM 360 Models](http://learnforge.autodesk.io/#/tutorials/viewhubmodels)

**Blogs**:
- [Forge Blog](https://forge.autodesk.com/categories/bim-360-api)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

## License
This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by
Zhong Wu [@johnonsoftware](https://twitter.com/johnonsoftware), [Developer Advocate and Support](http://forge.autodesk.com)