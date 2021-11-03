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

const { HubsApi, ProjectsApi } = require('forge-apis');
const {createTreeNode} = require("./apiclient");

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getHubs(oauthClient, credentials, res) {
    const hubs = new HubsApi();
    const data = await hubs.getHubs({}, oauthClient, credentials);
    const treeNodes = data.body.data.map((hub) => {
        if( hub.attributes.extension.type === 'hubs:autodesk.bim360:Account'){
            const hubType = 'bim360Hubs';
            return createTreeNode(
                hub.links.self.href,
                hub.attributes.name,
                hubType,
                null,
                true
            );
        }else
            return null;
        });
    // Only BIM360 hubs are supported for now
    res.json(treeNodes.filter(node => node !== null));
}

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getProjects(hubId, oauthClient, credentials, res) {
    const projects = new ProjectsApi();
    const data = await projects.getHubProjects(hubId, {}, oauthClient, credentials);

    const treeNodes = data.body.data.map((project) => {
        let projectType = 'projects';
        switch (project.attributes.extension.type) {
            case 'projects:autodesk.core:Project':
                return null;
            case 'projects:autodesk.bim360:Project':
                if(project.attributes.extension.data.projectType == 'ACC'){
                    projectType = 'accprojects';  
                }else{
                    return null; 
                }
                break;
        }
        return createTreeNode(
            project.links.self.href,
            project.attributes.name,
            projectType,
            project.relationships.cost.data.id,
            true
        );
    })
    // only support ACC project
    res.json(treeNodes.filter(node => node !== null));
}

module.exports = {
    getHubs,
    getProjects
}