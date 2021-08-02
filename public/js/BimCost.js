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


// Define method String.replaceAll 
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };
}

// the cost table instance
var costTable = null

// the following 2 strings will be used to replace ',' and '\n'
const Enter_Replacement = '\xfe';
const Comma_Replacement = '\xfd';

const Editable_String = "(Editable)";

// Data type
const CostDataType = {
  BUDGET   : 'budget',
  CONTRACT : 'contract',
  COST_ITEM: 'costitem',
  CHANGE_ORDER: 'changeorder',
  PCO : 'pco',
  RFQ : 'rfq',
  RCO : 'rco',
  OCO : 'oco',
  SCO : 'sco'
}

// columns that would be removed by "Human readable form"
const NotRelevantProperties = {
  [CostDataType.BUDGET]: [
    'id',
    'containerId',
    'mainContractId',
    'mainContractItemId',
    'mainContract',
    'properties',
  ],
  [CostDataType.CONTRACT]: [
    'id',
    'containerId',
    'mainContractId',
    'templateId',
    'statusId',
    'properties'
  ],
  [CostDataType.COST_ITEM]: [
    'id',
    'containerId',
    'mainContractId',
    'budgetStatusId',
    'costStatusId',
    'properties'
  ],
  [CostDataType.CHANGE_ORDER]: [
    'id',
    'containerId',
    'mainContractId',
    'markupFormulaId',
    'templateId',
    'budgetStatusId',
    'costStatusId',
    'formDefinitionId',
    'properties'
  ]
};


// ids which could be replaced by the real data
const IdProperties = {
  [CostDataType.BUDGET]: [
    'parentId',
    'rootId',
    'contractId',
    'creatorId',
    'changedBy'
  ],
  [CostDataType.CONTRACT]: [
    'companyId',
    'contactId',
    'recipients',
    'budgets',
    'creatorId',
    'ownerId',
    'changedBy',
    'signedBy',

  ],
  [CostDataType.COST_ITEM]: [
    'budgetId',
    'budget',
    'creatorId',
    'changedBy'
  ],
  [CostDataType.CHANGE_ORDER]: [
    'contractId',
    'companyId',
    'recipients',
    'creatorId',
    'ownerId',
    'changedBy',
    'signedBy',
  ]
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Cost Table class that manage the operation to the table
class CostTable {
  constructor(tableId, costContainerId, projectHref, currentDataType = CostDataType.BUDGET, dataSet = []) {
    this.tableId = tableId;
    this.costContainerId = costContainerId;
    this.projectHref = projectHref;
    this.dataSet = dataSet;
    this.currentDataType = currentDataType;
    this.isHumanReadable = false;
    this.csvData = null;
    this.cachedInfo = {
      DataInfo: []
    }
  };
  

  // get the required data for cost table
  async fetchDataOfCurrentDataTypeAsync() {
    this.dataSet = [];
    try {
      const requestUrl = '/api/forge/cost/info';
      const requetData = {
        'costContainerId': this.costContainerId,
        'costType': this.currentDataType
      };
      this.dataSet = await apiClientAsync(requestUrl, requetData);
    } catch (err) {
      console.log(err);
    }
  };


  // prepare|customize the data to be displayed in the cost table
  async polishDataOfCurrentDataTypeAsync() {
    if(this.dataSet.length === 0)
      return;

    try {
      this.customizeProperties();
      if (this.humanReadableData) {
        this.humanReadableTitles();
        await this.updateIdToHumanReadableData();
        this.removeNotRelevantColumns();
      }
      this.appendEditable();
      this.csvData = this.prepareCSVData();
    }
    catch (err) {
      console.log(err);
    }
  };


  // raw data or human readable data
  set IsHumanReadable(isHumanReadable = fasle) {
    this.humanReadableData = isHumanReadable;
  };

  // get current cost data type 
  get CurrentDataType(){
    return this.currentDataType;
  }

  // set current cost data type
  set CurrentDataType(dataType = CostDataType.BUDGET) {
    this.currentDataType = dataType;
    switch (this.currentDataType) {
      case CostDataType.BUDGET: {
        this.tableId = '#budgetsTable';
        break;
      }
      case CostDataType.CONTRACT: {
        this.tableId = '#contractsTable';
        break;
      }
      case CostDataType.COST_ITEM:
      case CostDataType.PCO:
      case CostDataType.RFQ:
      case CostDataType.RCO:
      case CostDataType.OCO:
      case CostDataType.SCO: {
        this.tableId = '#changeOrderTable';
        break;
      }
    }
  };

  // current table id
  set CurrentTableId(newTableId) {
    this.tableId = newTableId;
  };

  // draw the cost table based on the current data
  drawCostTable() {
    let columns = [];
    if (this.dataSet.length !== 0) {
      for (var key in this.dataSet[0]) {
        columns.push({
          field: key,
          title: key,
          align: "center"
        })
      }
    }

    $(this.tableId).bootstrapTable('destroy');

    $(this.tableId).bootstrapTable({
      data: this.dataSet,
      editable: true,
      clickToSelect: true,
      cache: false,
      showToggle: false,
      showPaginationSwitch: true,
      pagination: true,
      pageList: [5, 10, 25, 50, 100],
      pageSize: 5,
      pageNumber: 1,
      uniqueId: 'id',
      striped: true,
      search: true,
      showRefresh: true,
      minimumCountColumns: 2,
      smartDisplay: true,
      columns: columns
    });
  };


  // export data in cost table to CSV file
  exportCSV() {
    let csvString = this.csvData.join("%0A");
    let a = document.createElement('a');
    a.href = 'data:attachment/csv,' + csvString;
    a.target = '_blank';
    a.download = this.currentDataType + (new Date()).getTime()+ '.csv';
    document.body.appendChild(a);
    a.click();
  }


  // protected: remove not relevant properties to make it clear
  removeNotRelevantColumns = function() {
    let currentType = null;
    if (this.currentDataType === CostDataType.PCO ||
      this.currentDataType === CostDataType.RFQ ||
      this.currentDataType === CostDataType.RCO ||
      this.currentDataType === CostDataType.OCO ||
      this.currentDataType === CostDataType.SCO) {
      currentType = CostDataType.CHANGE_ORDER;
    }
    else {
      currentType = this.currentDataType;
    }

    NotRelevantProperties[currentType].forEach((propertyName) => {
      this.removeColumns(propertyName)
    })
  }




  // protected: adjust the value of some array|object properties, including custom attributes, adjustments, recipients
  // budgets,formInstances, costItems
  customizeProperties = function() {
    for (var key in this.dataSet[0]) {
      if (key === 'adjustments') {
        this.dataSet.forEach((rowData) => {
          if (rowData[key] != null) {
            rowData[key] = rowData[key].total;
          }
        })
        continue;
      }

      // property in cost item enitity
      if (key === 'budget') {
        this.dataSet.forEach((rowData) => {
          if( rowData[key] != null ){
            rowData[key] = rowData[key].id;
          }
        })
        continue;
      }     

      if (Array.isArray(this.dataSet[0][key])) {
        this.dataSet.forEach((rowData) => {
          switch (key) {
            case 'recipients':
              let recipientsText = '';
              if (rowData[key] !== null) {
                const recipientCount = rowData[key].length;
                for (let i = 0; i < recipientCount; ++i) {
                  recipientsText += rowData[key][i].id;
                  recipientsText += ';  ';
                }
                rowData[key] = recipientsText;
              }
              break;

            // make all the custom attributes as new column.
            case 'properties':
              const propertyCount = rowData[key].length;
              for (let i = 0; i < propertyCount; ++i) {
                let customPropertyKey = '';
                // only show the property definition id in raw mode
                customPropertyKey = 'CA:' + rowData[key][i].name + ':' + rowData[key][i].propertyDefinitionId;
                let propertyValue = rowData[key][i].value;
                rowData[customPropertyKey] = propertyValue ? propertyValue.replaceAll('\n', ';') : propertyValue;
              }
              rowData[key] = 'N/A';
              break;

            // "budgets" properties when include formInstances in GET Contracts
            case 'budgets':
              let budgetsText = '';
              const budgetCount = rowData[key].length;
              for (let i = 0; i < budgetCount; ++i) {
                budgetsText += rowData[key][i].id;
                budgetsText += ';  ';
              }
              rowData[key] = budgetsText;
              break;

            // "formInstances" properties when include formInstances in GET Cost Items
            case 'formInstances':
              let formInstancesText = '';
              const formInstanceCount = rowData[key].length;
              for (let i = 0; i < formInstanceCount; ++i) {
                formInstancesText += rowData[key][i].formDefinition.name;
                formInstancesText += ' : ';
                formInstancesText += rowData[key][i].name;
                formInstancesText += ';  ';
              }
              rowData[key] = formInstancesText;
              break;

            // "costItems" properties when include costItems in GET Change Orders
            case 'costItems':
              let costItemsText = '';
              const costItemCount = rowData[key].length;
              for (let i = 0; i < costItemCount; ++i) {
                costItemsText += rowData[key][i].name;
                costItemsText += ';  ';
              }
              rowData[key] = costItemsText;
              break;
            default:
              rowData[key] = "N/A";
              break;
          };
        })
      }
    }
  };



  // protected: Append the string "Editable" to the property name if this could be edited
  appendEditable(){
    for (var key in this.dataSet[0]) {
      const editableProp = isTypeSupported( key, this.currentDataType )
      if (editableProp === TypeSupported.NOT_SUPPORTED ) {
        continue;
      }
      let newKey = key + Editable_String;
      this.dataSet.forEach((row) => {
        row[newKey] = row[key];
        delete row[key];
      })
    }
  }


  // protected: change the title to be easily understood, mainly remove the GUID for custom attribute
  humanReadableTitles() {
    for (var key in this.dataSet[0]) {
      // remove the GUID if it's custom attribute
      const params = key.split(':');
      if (params[0] === 'CA') {
        let newKey = params[0] + ':' + params[1];
        this.dataSet.forEach( (row) => {
          row[newKey] = row[key];
          delete row[key];
        } )
      }
    }
  }


  // protected: change to the real data from the Id for specified column
  async updateIdToHumanReadableData() {

    let currentType = null;
    if( this.currentDataType === CostDataType.PCO ||
      this.currentDataType === CostDataType.RFQ ||
      this.currentDataType === CostDataType.RCO ||
      this.currentDataType === CostDataType.OCO ||
      this.currentDataType === CostDataType.SCO ){
        currentType = CostDataType.CHANGE_ORDER;
      }
      else{
        currentType = this.currentDataType;
      }


    await Promise.all(
      IdProperties[currentType].map( async (propertyName) => {
        try{
          await this.updateTableContent(propertyName);
        }catch(err){
          console.log(err);
        }
      })
    )
    console.log( "all the ids are updated to real content." );
  };



  // protected: update all the properties within this column to the real name
  async updateTableContent(keyName) {
    /// get the real data from the Id
    for (let i in this.dataSet ) {
      if (keyName == null || this.dataSet[i][keyName] == null)
        continue;

      let idArray = this.dataSet[i][keyName].split(';');
      let textArray = [];

      // wait here until all the ids are converted.
      await Promise.all(
        idArray.map(async (id) => {
          const idWithoutSpace = id.split(' ').join('');
          if (idWithoutSpace === '')
            return;
          // Check if it's cached
          let dataCached = false;
          // const cacheCount = this.cachedInfo.DataInfo.length;
          for (let j in this.cachedInfo.DataInfo ) {
            if (this.cachedInfo.DataInfo[j].Id === idWithoutSpace) {
              textArray.push(this.cachedInfo.DataInfo[j].Value);
              dataCached = true;
              break;
            }
          }
          if (!dataCached) {
            try {
              const realValue = await this.getContentFromId(keyName, idWithoutSpace);
              this.cachedInfo.DataInfo.push({ Id: idWithoutSpace, Value: realValue })
              textArray.push(realValue);
            }
            catch (err) {
              console.log("Failed to get data " + idWithoutSpace + " for " + keyName);
            }
          }
        })
      )
      this.dataSet[i][keyName] = textArray[0];
      for (let k = 1; k < textArray.length; k++) {
        this.dataSet[i][keyName] = this.dataSet[i][keyName] + ';' + textArray[k];
      }
    }
  }


  // protected: get the real data for the specified id
  async getContentFromId(propertyName, propertyId) {
    if (propertyName == null || propertyId == null) {
      console.log('input parameters is not valid.');
      return;
    }
    const requestUrl = '/api/forge/bim360/type/' + encodeURIComponent(propertyName) + '/id/' + encodeURIComponent(propertyId);
    const requestData = {
      'projectHref': this.projectHref,
      'costContainerId': this.costContainerId
    };
    try{
      const respBody = await apiClientAsync(requestUrl, requestData);
      return respBody.name;
    }catch(err){
      console.error( err );
      return 'Not Found';
    }
  }



  // protected: update the cost entity info
  async updateEntityInfo(requestData) {
    try{
      const requestUrl = '/api/forge/cost/info';
      const requestBody = {
        'projectHref': this.projectHref,
        'costContainerId': this.costContainerId,
        'costType': this.currentDataType,
        'requestData': requestData
      };
      return await apiClientAsync( requestUrl, requestBody, 'post');
    }catch(err){
      console.error(err);
      return null;
    }
  }
  

  // protected: update the custom attribute info
  async updateCustomAttribute( associationId, propertyDefinitionId, propertyValue) {
    let associationType = null;
    switch (this.currentDataType ) {
      case 'budget': {
        associationType = 'Budget';
        break;
      }
      case 'contract': {
        associationType = 'Contract';
        break;
      }
      case 'costitem': {
        associationType = 'CostItem';
        break;
      }
      case 'pco':
      case 'rfq':
      case 'rco':
      case 'oco':
      case 'sco': {
        associationType = 'FormInstance';
        break;
      }
    }
    const requestBody = {
      'costContainerId': this.costContainerId,
      'requestData': [{
        'associationType': associationType,
        'associationId': associationId,
        'propertyDefinitionId': propertyDefinitionId,
        'value': propertyValue
      }]
    };  
    return await apiClientAsync( '/api/forge/cost/attribute', requestBody, 'post');
  }


  // protected: get the data cached to be exported to CSV later
  prepareCSVData() {

    let csvRows = [];
    let csvHeader = [];

    // Set the header of CSV
    for (var key in this.dataSet[0]) {
      csvHeader.push(key);
    }
    csvRows.push(csvHeader);

    // Set the row data of CSV
    this.dataSet.forEach((item) => {
      let csvRowTmp = [];
      for (key in item) {
        // TBD: special handle scopeOfWork property since it includes a rich text
        if (key === 'scopeOfWork' && item[key] != null ) {
          let tmpStr = item[key].replaceAll(',', Comma_Replacement).replaceAll('\n', Enter_Replacement);
          csvRowTmp.push( tmpStr );
        }else{
          csvRowTmp.push( item[key] );
        }
      }
      csvRows.push(csvRowTmp);
    })
    return csvRows;
  };


    // private: remove the specified column
    removeColumns(columnName) {
      this.dataSet.forEach((item) => {
        if (typeof item[columnName] != null ) {
          delete item[columnName];
        }
      })
    }
}

// Event while DOM tree is ready
$(document).ready(function () {

  // Show|Hide the message for import operation
  $('input:radio[name="exportOrImport"]').click(function () {
    var checkValue = $('input:radio[name="exportOrImport"]:checked').val();
    if (checkValue === 'import') {
      $('#importParameters').show();
    } else {
      $('#importParameters').hide();
    }
  });

  $('#executeCSV').click(function () {
    exporting = $('input[name="exportOrImport"]:checked').val() === 'export';
    // Export the current table
    if (exporting) {
      if( !costTable || !costTable.csvData ){
        alert('Please get the data first.')
        return;
      }
      costTable.exportCSV();
    } else {
      // Import data from selected CSV file
      var fileUpload = document.getElementById("inputFile");
      var regex = /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.csv|.txt)$/;
      if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
          var reader = new FileReader();
          reader.onload = async function (e) {
            if(!costTable) {
              alert('please select one project!');
              return;
            }

            $('#executeCSV').hide();
            $('.importInProgress').show();
        
            var rows = e.target.result.split("\n");
            const keys = rows[0].split(',');

            for (var i = 1; i < rows.length; i++) {
              var jsonData = {};
              var cells = rows[i].split(",");
              if (cells.length > 1) {
                for (var j = 0; j < cells.length; j++) {

                  // Remove '(Editable)' from the title
                  const newKey = keys[j].split(Editable_String).join('');

                  // always keep 'id' in the request body.
                  if( newKey === 'id'){
                    jsonData[newKey] = cells[j];
                    continue;
                  }
                  const typeSupported = isTypeSupported(newKey, costTable.CurrentDataType);
                  if (typeSupported === TypeSupported.STRING) {
                    jsonData[newKey] = cells[j];
                    continue;
                  }
                  if (typeSupported === TypeSupported.NUMBER) {
                    jsonData[newKey] = parseFloat(cells[j]);
                    // jsonData[newKey] = parseInt(cells[j]);
                    continue;
                  }
                  if (typeSupported === TypeSupported.CUSTOM_ATTRIBUTE) {
                    const params = newKey.split(':');
                    try {
                      // TBD: interesting, it always add '\r' at the end of the string, workaround for now.
                      await costTable.updateCustomAttribute( jsonData['id'], params[params.length - 1].split('\r').join(''), cells[j].split('\r').join(''));
                    } catch (err) {
                      console.log('Failed to update custom attribute ' + params[params.length - 2] + ' : ' + cells[j]);
                    }
                  }
                }
              }
              try {
                await costTable.updateEntityInfo(jsonData);
              } catch (err) {
                console.log(err);
              }
            }
            $('#executeCSV').show();
            $('.importInProgress').hide();
        
            $('#btnRefresh').click();
          }
          reader.readAsText(fileUpload.files[0]);
        } else {
          alert("This browser does not support HTML5.");
        }
      } else {
        alert("Please upload a valid CSV file.");
      }
    }
  });


  $('#btnRefresh').click(async () => {
    const projectHref = $('#labelProjectHref').text();
    const costContainerId = $('#labelCostContainer').text();
    if (projectHref === '' || costContainerId === '') {
      alert('please select one project!');
      return;
    }

    $('.clsInProgress').show();
    $('.clsResult').hide();

    // get the active tab
    const activeTab = $("ul#costTableTabs li.active").children()[0].hash;
    switch( activeTab ){
      case '#budget':{
        costTable.CurrentDataType = CostDataType.BUDGET;
        break;
      }
      case '#contract':{
        costTable.CurrentDataType = CostDataType.CONTRACT;
        break;
      }
      case '#changeorder':{
        costTable.CurrentDataType = $('input[name="order_type"]:checked').val();
        break;
      }
    }

    costTable.IsHumanReadable = $('input[name="dataTypeToDisplay"]:checked').val() === 'humanReadable';
    try{
      await costTable.fetchDataOfCurrentDataTypeAsync();
      await costTable.polishDataOfCurrentDataTypeAsync();
      costTable.drawCostTable();  
    }catch(err){
      console.log(err);
    }

    $('.clsInProgress').hide();
    $('.clsResult').show();
  })

  $("input[name='order_type']").click(function ( e ) {
    $('#btnRefresh').click();
  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    $('#btnRefresh').click();
  });
});


/// string properties that can be updated
const SupportedStringTypes = {
  'budget': [
    'code',
    'name',
    'description',
    'contactId',
    'unit'
  ],
  'contract': [
    'code',
    'name',
    'description',
    'type',
    'companyId',
    'contactId',
    'signedBy',
    'ownerId'
  ],
  'costitem': [
    'name',
    'description',
    'budgetId'
  ],
  'changeorder': [
    'name',
    'description',
    'ownerId'
  ],
}


/// numeric properties that can be updated
const SupportedNumberTypes = {
  'budget': [
    'unitPrice',
    'quantity',
    'actualCost',
  ],
  'contract': [
  ],
  'costitem': [
    'estimated',
    'proposed',
    'submitted',
    'approved',
    'committed'
  ],
  'changeorder': [
  ]
}

/// data type that is supported to be updated
const TypeSupported = {
  NUMBER: 0,
  STRING: 1,
  CUSTOM_ATTRIBUTE: 2,
  NOT_SUPPORTED: 9
}


// check if the property is supported to be updated
function isTypeSupported(propertyName, costType='budget' ) {

  if (costType === CostDataType.PCO ||
    costType === CostDataType.RFQ ||
    costType === CostDataType.RCO ||
    costType === CostDataType.OCO ||
    costType === CostDataType.SCO) {
    costType = CostDataType.CHANGE_ORDER
  }

  for (var key in SupportedNumberTypes[costType]) {
    if (propertyName === SupportedNumberTypes[costType][key])
      return TypeSupported.NUMBER;
  }

  for (var key in SupportedStringTypes[costType]) {
    if (propertyName === SupportedStringTypes[costType][key])
      return TypeSupported.STRING;
  }

  const params = propertyName.split(':');
  if (params[0] === 'CA')
    return TypeSupported.CUSTOM_ATTRIBUTE;

  return TypeSupported.NOT_SUPPORTED;
}


// helper function for Request
function apiClientAsync( requestUrl, requestData=null, requestMethod='get' ) {
  let def = $.Deferred();

  if( requestMethod == 'post' ){
    requestData = JSON.stringify(requestData);
  }

  jQuery.ajax({
    url: requestUrl,
    contentType: 'application/json',
    type: requestMethod,
    dataType: 'json',
    data: requestData,
    success: function (res) {
      def.resolve(res);
    },
    error: function (err) {
      console.error('request failed:');
      def.reject(err)
    }
  });
  return def.promise();
}
