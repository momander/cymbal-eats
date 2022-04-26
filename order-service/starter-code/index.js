const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
//TODO 1: Initialize an instance of Firestore

const inventoryServer = axios.create({
  baseURL: process.env.INVENTORY_SERVICE_URL,
  headers :{ 
    get: {
      "Content-Type": 'application/json'
    }
  }
})

app.post('/place-order', async (req, res) => {
  try {
    if (! await inventoryAvailable(req.body.orderItems)) {
      throw 'Incorrect Order Quantity or Item';
    }
    const orderNumber = await createOrderRecord(req.body);
    await subtractFromInventory(req.body.orderItems);
    res.json({orderNumber: orderNumber});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
})

app.delete('/:orderNumber', async (req, res) => {
  try {
    //4. TODO: Delete a document
    res.json({status: 'success'});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
})

app.patch('/:orderNumber', async (req, res) => {
  try {
    //TODO 3: Update a document
    res.json({status: 'success'});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
})

async function inventoryAvailable(orderItems) {
  const inventory = await inventoryServer.get("/getAvailableInventory");
  const inventoryDict = {};
  for (item in inventory.data) {
    inventoryDict[parseInt(inventory.data[item].ItemID)] = inventory.data[item].Inventory;
  }
  for (oI in orderItems) {
    var orderItem = orderItems[oI];
    if (!(orderItem.id in inventoryDict) || (inventoryDict[orderItem.id] < orderItem.quantity)) {
      return false;
    }
  }
  return true;
}

async function createOrderRecord(requestBody) {
  const orderNumber = getNewOrderNumber();
  //TODO 2: Create a new document
  return orderNumber;
}

async function subtractFromInventory(orderItems) {
  await inventoryServer.post("/updateInventoryItem", 
    orderItems.map(x => ({
      itemID: x.id,
      inventoryChange: -x.quantity
    }))
  );
}

function getNewOrderNumber() {
  return Math.round(10000 + Math.random() * 90000);
}
