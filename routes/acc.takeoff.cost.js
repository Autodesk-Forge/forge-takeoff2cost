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


var express = require('express'); 
var router = express.Router(); 
var config = require('../config'); 

const { apiClientCallAsync } = require('./common/apiclient');
const { OAuth } = require('./common/oauthImp');


/////////////////////////////////////////////////////////////////////////////
// Add String.format() method if it's not existing
if (!String.prototype.format) {
  String.prototype.format = function () {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined'
              ? args[number]
              : match
              ;
      });
  };
}


///////////////////////////////////////////////////////////////////////
/// Middleware for obtaining a token for each request.
///////////////////////////////////////////////////////////////////////
router.use(async (req, res, next) => {
  const oauth = new OAuth(req.session);
  req.oauth_client = oauth.getClient();
  req.oauth_token = await oauth.getInternalToken();  
  next();   
});

// /////////////////////////////////////////////////////////////////////
// / Get items of takeoff package
// /////////////////////////////////////////////////////////////////////
router.get('/takeoff/:project_id/packages/:package_id/items', async function(req, res){
  const packageId = req.params.package_id;
  const projectId = req.params.project_id;
  if ( packageId === '' ||  projectId == '') {
      return (res.status(400).json({
          diagnostic: 'Missing input parameters'
      }));
  }

  const takeoffItemsUrl = config.bim360TakeOff.URL.TAKEOFF_ITEMS_URL.format(projectId, packageId);
  let result = null;
  try {
    result = await apiClientCallAsync('GET', takeoffItemsUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'Failed to get takeoff items from ACC'
    }));
  }
  return (res.status(200).json(result.body.results));
})



// /////////////////////////////////////////////////////////////////////
// / Get types of takeoff package
// /////////////////////////////////////////////////////////////////////
router.get('/takeoff/:project_id/packages/:package_id/types', async function(req, res){
  const packageId = req.params.package_id;
  const projectId = req.params.project_id;
  if ( packageId === '' ||  projectId == '') {
      return (res.status(400).json({
          diagnostic: 'Missing input parameters'
      }));
  }

  const requestUrl = config.bim360TakeOff.URL.TAKEOFF_TYPES_URL.format(projectId, packageId);
  let result = null;
  try {
    result = await apiClientCallAsync('GET', requestUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'Failed to get takeoff types from ACC'
    }));
  }
  return (res.status(200).json(result.body.results));
})




// /////////////////////////////////////////////////////////////////////
// / Import budgets to ACC Cost module
// /////////////////////////////////////////////////////////////////////
router.post('/da4revit/bim360/budgets', async (req, res, next) => {
  const cost_container_id = req.body.cost_container_id;
  const budgetList  = req.body.data;
  if ( budgetList === '' ) {
      return (res.status(400).json({
          diagnostic: 'Missing input body info'
      }));
  }
  const importBudgetsUrl =  config.bim360Cost.URL.IMPORT_BUDGETS_URL.format(cost_container_id);
  let budgetsRes = null;
  try {
      budgetsRes = await apiClientCallAsync( 'POST',  importBudgetsUrl, req.oauth_token.access_token, budgetList);
  } catch (err) {
      console.error(err);
      return (res.status(500).json({
    diagnostic: 'Failed to import budgets into ACC Cost product'
      }));
  }
  return (res.status(200).json(budgetsRes.body));
});

module.exports = router