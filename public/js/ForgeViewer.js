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

var viewer;
var objectIds = [];

function launchViewer(urn, object_id) {
  objectIds = [];
  objectIds.push( object_id);

  var options = {
    env: 'AutodeskProduction2',
    api: 'streamingV2',
    getAccessToken
  };

  Autodesk.Viewing.Initializer(options, function onInitialized() {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'));
    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}


function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then( async (model) => {
    // Highlight the takeoff element after geometry is loaded
    await Autodesk.Viewing.EventUtils.waitUntilGeometryLoaded(viewer);
    viewer.isolate(objectIds);
    viewer.fitToView(objectIds);
  });
}


function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}


async function getAccessToken(callback) {
  const resp = await fetch('/api/forge/oauth/token');
  if (resp.ok) {
      const { access_token, expires_in } = await resp.json();
      callback(access_token, expires_in);
  } else {
      alert('Could not obtain access token. See the console for more details.');
      console.error(await resp.text());
  }
}
