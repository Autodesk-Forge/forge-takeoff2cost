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
'use strict';   

const { createTreeNode, apiClientCallAsync } = require('./apiclient');
var config = require('../../config'); 

const { base64encode } = require('nodejs-base64');

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getPackages( projectId, token, res){
    const packagesUrl =  config.bim360TakeOff.URL.PACKAGES_URL.format(projectId);
    let packagesRes = null;
    try {
        packagesRes = await apiClientCallAsync('GET', packagesUrl, token.access_token);
    } catch (err) {
      console.error(err)
    }

    res.json(packagesRes.body.results.map((item) => {
        return createTreeNode(
            projectId+'/packages/'+ item.id,
            "Package: " + item.name,
            "packages",
            null,
            true
        );
    }));
}

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getTakeoffItems( projectId, packageId, token, res){    
    const takeoffTypesUrl =  config.bim360TakeOff.URL.TAKEOFF_TYPES_URL.format(projectId, packageId);
    var typesRes = null;
    try {
        typesRes = await apiClientCallAsync('GET', takeoffTypesUrl, token.access_token);
    } catch (err) {
      console.error(err)
    }

    const takeoffItemsUrl =  config.bim360TakeOff.URL.TAKEOFF_ITEMS_URL.format(projectId, packageId);
    let packagesRes = null;
    try {
        packagesRes = await apiClientCallAsync('GET', takeoffItemsUrl, token.access_token);
    } catch (err) {
      console.error(err)
    }

    res.json(packagesRes.body.results.map((item) => {
        // Replace typeid to typename
        let typeName = '';
        for( const type of typesRes.body.results ){
            if(item.takeoffTypeId === type.id){
                typeName = type.name;
                break;
            }
        }
        return createTreeNode(
            base64encode(encodeURI(item.contentView.version))+'.'+item.id+'.'+item.objectId,
            item.objectName? typeName+'- '+item.objectName : typeName+'- '+item.type,
            "takeoffitems",
            null,
            false
        );
    }));
}


module.exports = {
    getPackages,
    getTakeoffItems
}