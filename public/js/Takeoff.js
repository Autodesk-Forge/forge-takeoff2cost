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


var costMgrInstance = null;

///////////////////////////////////////////////////////////////////////
/// Class to handle PriceBook database
///////////////////////////////////////////////////////////////////////
class PriceBook {
  constructor() {
    this.priceBookUrl = '/api/forge/pricebook/items';
    this.priceInfo = [];
  }

  async initPriceBook() {
    try {
      this.priceInfo = await apiClientAsync(this.priceBookUrl);
    } catch (err) {
      console.error(err);
      this.priceInfo = null;
    }
  }


  getPriceTableData(){
    let priceData = [];
    for (let key in this.priceInfo) {
      if(!this.priceInfo[key].Type)
        continue;
      priceData.push( [this.priceInfo[key].Type, this.priceInfo[key].Price, this.priceInfo[key].Unit]);
    }
    return priceData;
  }


  getPriceInfoForElement(elementName) {
    for (let key in this.priceInfo) {
      if (this.priceInfo[key].Type === elementName) {
        return this.priceInfo[key];
      }
    }
    return null;
  }
}



///////////////////////////////////////////////////////////////////////
/// Class to handle price book table
///////////////////////////////////////////////////////////////////////
class PricebookTable {

  static Price_Table_Columns = [
    { title: "Type" },
    { title: "Unit Price($)" },
    { title: "Unit" }
  ];

  constructor(tableId) {
    this.tableId = tableId;
    this.priceBook = new PriceBook();
    this.table = $(tableId).DataTable({
      pageLength:10,
      data: [],
      columns: PricebookTable.Price_Table_Columns
    });
  }

  async refreshTable() {
    if (this.table === null) {
      console.error('The table is not initialized, please re-check');
      return;
    }
    await this.priceBook.initPriceBook();
    let data = this.priceBook.getPriceTableData();
    this.table.clear().rows.add(data).draw();
  }


  getPricebookItems() {
    var priceList = [];
    if (this.table !== null) {
      this.table.data().toArray().forEach((priceItem) => {
        const item = {
          name: priceItem[0],
          unitPrice: priceItem[1],
          unit: priceItem[2]
        }
        priceList.push(item);
      })
    }
    return priceList;
  }
}




///////////////////////////////////////////////////////////////////////
/// Class to handle Package takeoff table
///////////////////////////////////////////////////////////////////////
class PackageTakeoffTable {

  static Package_Table_Columns = [
    { title: "Element" },
    { title: "Quantity" },
    { title: "Unit" },
    { title: "Unit Price($)" },
    { title: "Amount($)" }
  ];

  constructor(tableId, dataSet = []) {
    this.tableId = tableId;
    this.table = $(tableId).DataTable({
      pageLength: 10,
      data: dataSet,
      columns: PackageTakeoffTable.Package_Table_Columns
    });
  }

  refreshTable(dataSet = null) {
    if (this.table === null) {
      console.error('The table is not initialized, please re-check');
      return;
    }
    const newData = dataSet ? dataSet : this.table.data();
    this.table.clear().rows.add(newData).draw();
  }


  getBudgetList(budgetCodeLength ) {
    var budgetData = [];
    if (this.table !== null) {
      this.table.data().toArray().forEach((budgetItem) => {
        const item = {
          parentId: null,
          name: budgetItem[0],
          code: makeBudgetCode(budgetCodeLength),
          quantity: parseInt(budgetItem[1]),
          unit: budgetItem[2],
          unitPrice: budgetItem[3],
          description: "budget description"
        }
        budgetData.push(item);
      })
    }
    return budgetData;
  }
}

///////////////////////////////////////////////////////////////////////
/// Class to manage the operation to takeoff
///////////////////////////////////////////////////////////////////////
class PackageCostManager {
  constructor() {
    this.packageTable = new PackageTakeoffTable('#packageTakeoffTable');
    this.pricebookTable = new PricebookTable('#pricebookTable');    
  }

  get PricebookTable(){
    return this.pricebookTable;
  }

  get PackageTakeoffTable() {
    return this.packageTable;
  }

  async loadPriceTable(){
    if(this.pricebookTable != null )
      await this.pricebookTable.refreshTable();
  }

  async refreshPackageCost( nodeId ){
    let params = nodeId.split('/');
    if( params.length !== 3 ){
      alert('the selected node id is not in correct format');
      return 
    }
    // Get the takeoff types for the package
    let takeoffTypeList = [];
    const takeoffTypesUrl = '/api/forge/takeoff/' + encodeURIComponent(params[0]) + '/packages/'+ encodeURIComponent(params[params.length-1])+'/types';
    try {
      takeoffTypeList = await apiClientAsync(takeoffTypesUrl);
    } catch (err) {
      console.error(err);
      return false;
    }
 
    let result = null;
    const takeoffItemsUrl = '/api/forge/takeoff/' + encodeURIComponent(params[0]) + '/packages/'+ encodeURIComponent(params[params.length-1])+'/items';
    try {
      result = await apiClientAsync(takeoffItemsUrl);
    } catch (err) {
      console.error(err);
      return false;
    }

    let costItems = [];
    for( let item in result ){
      let itemExisting = false;
      for( let i in costItems ){
        if( costItems[i].type === result[item].takeoffTypeId ){
          itemExisting = true;
          costItems[i].quantity += result[item].primaryQuantity.quantity;
          break;
        }
      }
      if(itemExisting )
        continue;
      costItems.push({ 'type': result[item].takeoffTypeId, 'quantity': result[item].primaryQuantity.quantity })
    }

    for( let i in costItems ){
      for( let type of takeoffTypeList){
        if( costItems[i].type === type.id ){
          costItems[i].type = type.name;
          break;
        }
      }
    }

    const priceItems = this.pricebookTable.getPricebookItems();
    let priceList = costItems.map( (item)=>{
      for(let priceItem of priceItems ){
        if( item.type.toLowerCase() === priceItem.name.toLowerCase() ){
          const totalPrice = accounting.formatMoney(item.quantity * priceItem.unitPrice);
          return([item.type, accounting.toFixed(item.quantity,2), priceItem.unit, priceItem.unitPrice, totalPrice ])
        }
      }
      return null
    } )
    this.packageTable.refreshTable( priceList.filter( item => { return(item !== null)}));
  }


  // send the budgets in table to ACC Cost product
  async sendToACCCost() {
    if (!this.packageTable)
      return false;

    let result = null;
    const costContainerId = $('#labelCostContainer').text();
    const costBudgetCodeTemplateUrl = '/api/forge/cost/' + costContainerId + '/budgetcode';
    try {
      result = await apiClientAsync(costBudgetCodeTemplateUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to access Cost product, please make sure cost is activated, and budget code template is setup.");
      return false;
    }
    let budgetCodeLength = 0;
    for (const seg of result.segments) {
      budgetCodeLength += seg.length;
    }
    if( budgetCodeLength == 0){
      alert("Cost budget code template does not set, please setup budget template first.");
      return false;
    }

    const budgetData = this.packageTable.getBudgetList(budgetCodeLength);
    const budgetBody = {
      data: budgetData,
      append: false
    }

    const requestUrl = '/api/forge/cost/budgets';
    const requestBody = {
      cost_container_id: costContainerId,
      data: budgetBody
    };
    try {
      const result = await apiClientAsync(requestUrl, requestBody, 'post');
      return true;
    } catch (err) {
      console.error('Failed to import budgets');
      return false;
    }
  }
}


///////////////////////////////////////////////////////////////////////
/// Document ready event
///////////////////////////////////////////////////////////////////////
$(document).ready(async function () {
  $('#sendToACCBtn').click(sendToACCHandler);
 
  costMgrInstance = new PackageCostManager();

  $('.pricebookInProgress').show();
  $('.pricebookResult').hide();
  await costMgrInstance.loadPriceTable();
  $('.pricebookInProgress').hide();
  $('.pricebookResult').show();
});



///////////////////////////////////////////////////////////////////////
/// Event to update the budgets info to BIM360 Cost module
///////////////////////////////////////////////////////////////////////
async function sendToACCHandler() {
  $('.clsSending2ACC').show();
  $('#sendToACCBtn')[0].disabled = true;

  if ( costMgrInstance ==null ) {
    alert('price table is not initialized.');
    return;
  }
  const result = await costMgrInstance.sendToACCCost();
  if( result ){
    alert('Budgets are imported to ACC Cost Module.')
  }else{
    alert('Failed to imported Budgets to ACC Cost Module.')
  }

  $('.clsSending2ACC').hide();
  $('#sendToACCBtn')[0].disabled = false;

  return;
}

/// helper function to generate ramdom budget code
function makeBudgetCode(length) {
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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