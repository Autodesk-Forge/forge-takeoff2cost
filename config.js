/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// Autodesk Forge configuration
module.exports = {
    // Set environment variables or hard-code here
    credentials: {
        client_id: process.env.FORGE_CLIENT_ID,
        client_secret: process.env.FORGE_CLIENT_SECRET,
        callback_url: process.env.FORGE_CALLBACK_URL
    },
    database:{
        url : process.env.OAUTH_DATABASE
    },    
    scopes: {
        // Required scopes for the server-side application
        internal: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],

        // Required scopes for the server-side BIM360 Account Admin
        internal_2legged: ['data:read', 'bucket:read', 'bucket:create', 'data:write', 'bucket:delete', 'account:read', 'account:write'],

        // Required scope for the client-side viewer
        public: ['viewables:read']
    },
    accountv1: {
        URL: {
            COMPANY_URL: "https://developer.api.autodesk.com/hq/v1/accounts/{0}/projects/{1}/companies",
            USER_URL: "https://developer.api.autodesk.com/hq/v1/accounts/{0}/users/{1}",
        }
    },


    bim360TakeOff: {
        URL: {
            PACKAGES_URL: "https://developer.api.autodesk.com/construction/takeoff/v1/projects/{0}/packages",
            PACKAGE_URL: "https://developer.api.autodesk.com/construction/takeoff/v1/projects/{0}/packages/{1}",

            TAKEOFF_ITEMS_URL: "https://developer.api.autodesk.com/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-items",
            TAKEOFF_TYPES_URL: "https://developer.api.autodesk.com/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-types",
        }
    },

    bim360Cost:{
        URL:{
            IMPORT_BUDGETS_URL: "https://developer.api.autodesk.com/cost/v1/containers/{0}/budgets:import",
            BUDGETS_RUL: "https://developer.api.autodesk.com/cost/v1/containers/{0}/budgets" 
        }
    },
};
