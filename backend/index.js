const https = require('https')
const express = require('express');
const cron = require('node-cron');
require('dotenv').config({path: './.env'})
const axios = require('axios');
const request = require("request");
const { application } = require('express');
const db = require('./queries.js')
const app = express()
const bodyParser = require('body-parser')
const { Pool, Client } = require("pg");
const { log } = require('console');
const cors = require("cors")
const api = process.env.BinanceApi;
const server = require('http').createServer(app)
const webSocket = require('ws');
const { message } = require('antd');
const wss_wallet = new webSocket.Server({server:server, path:'/getWallet'})
const wss_transactions = new webSocket.Server({port:3002, path:'/allTransactions'})

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(cors())

let webSocketTransaction, webSocketWallet;

async function getLatestPrice(){
    const response = await axios.get(api) 
    return response.data["price"];
}

async function createLatestPrice(time, price){
    await db.createLatestPrice(time, price)
    console.log(`Successully inserted ${price} at time ${time}`);  
}

async function getPrevTenMinsPrice(cTime){
    const pTime = cTime-parseFloat(process.env.timegap)
    const response = await db.findTenMinsPrice(pTime) 
    data  = JSON.parse(response)
    if(data.length == 0) return undefined
    return data[0]['price']
}

async function getPercentPriceDiff(cPrice, pPrice){ 
    if(pPrice === undefined) return 0
    return ((cPrice-pPrice)*100)/pPrice;
}

async function getLastTrans(){   
    const response = await db.lastTransaction()
    const data = JSON.parse(response)
    return { "time":data[0]["time_stamp"], "btc":data[0]["updated_btc_inventory"], "usdt":data[0]["updated_usdt_inventory"] }
}

function CalculateProfitLoss(currPrice, prevPrice, btc, usdt, updated_btc, updated_usdt){
    const prevValue = prevPrice*btc + usdt
    const currValue = currPrice*updated_btc + updated_usdt
    return (currValue-prevValue)
}

async function createOrder(priceDiff, time_stamp, currPrice, btc, usdt, prevPrice){
    var Order_type, updated_btc, updated_usdt
    const trade_amount = parseFloat(process.env.tradeAmount)
    const trade_value = trade_amount*currPrice;
    if(priceDiff>parseFloat(process.env.percDiff)){
        Order_type = 'Sell'
        updated_btc = btc - trade_amount
        updated_usdt = usdt + trade_value
    }
    else{
        Order_type = 'Buy'
        updated_btc = btc + trade_amount
        updated_usdt = usdt - trade_value
    }
    const profitLoss = CalculateProfitLoss(currPrice, prevPrice, btc, usdt, updated_btc, updated_usdt)
    
    db.createOrder(time_stamp, currPrice, trade_amount, trade_value, Order_type, updated_btc, updated_usdt, profitLoss)
    console.log(`${Order_type} order Placed in Database`);
    console.log(`Update wallet: BTC = ${updated_btc} and USDT = ${updated_usdt}`);
    
    if(profitLoss<0) console.log(`Our loss is ${profitLoss} USDT`);
    else console.log(`Our Profit is ${profitLoss} USDT`);
}



async function init() {
    console.log("Connecting to Database......");
    await db.connect_database();
    console.log("CronJob is starting....");
    cron.schedule('*/10 * * * * *', async () => {
        console.log("Getting latest price from Binance API");
        const currPrice  = await getLatestPrice()


        console.log(`Current price of USDT is ${currPrice}`);
        const currTime = Math.floor(new Date().getTime()/1000.0)


        console.log(`Inserting current price in Database`);
        await createLatestPrice(currTime, currPrice)


        console.log(`Getting previous 10 minutes price from Database`);
        const prevPrice = await getPrevTenMinsPrice(currTime)


        if(prevPrice == undefined) console.log("Previous 10 minutes price is not found");
        else console.log(`Previous 10 minutes price is ${prevPrice}`);
        console.log("Calculating Price difference Percentage");


        const priceDiff = await getPercentPriceDiff(currPrice, prevPrice)
        if(prevPrice == undefined) console.log(`Can't calculate as previous 10 minutes price is not found`);
        else console.log(`Price difference percentage is ${priceDiff}`);

        if(priceDiff>parseFloat(process.env.percDiff) || priceDiff<(-(parseFloat(process.env.percDiff)))){

            console.log("Condition meet... checking cooldown.....");
            const lastTrans = await getLastTrans()  //get last trans details(time, btc, usdt)


            if(currTime - lastTrans['time']>parseFloat(process.env.coolDown)){
                console.log(`Last transaction done before ${currTime - lastTrans['time']} minutes. Initializing transaction......`);
                console.log(`Wallet: BTC = ${lastTrans['btc']} and USDT = ${lastTrans['usdt']}`);
                console.log("Inserting transaction details in Database and updating wallet");
                
                
                await createOrder(priceDiff, currTime, currPrice, lastTrans['btc'], lastTrans['usdt'], prevPrice)
                if(webSocketTransaction === undefined){
                    console.log("Data not sent to frontend as WebSocketClient of transaction is not connected");
                }
                else{
                    await triggerWebSocketTransaction()
                    console.log("Sent to frontend via websocketTransaction");
                }
                if(webSocketWallet === undefined){
                    console.log("Data not sent to frontend as WebSocketClient of wallet is not connected");
                }
                else{
                    await triggerWebSocketWallet()
                    console.log("Sent to frontend via websocketWallet");
                }
                
            }
            else if(currTime - lastTrans['time']<parseFloat(process.env.coolDown) && 0<currTime - lastTrans['time']){
                console.log(`Cooldown period is on. Last transaction done before ${currTime - lastTrans['time']} minutes`);
            }
        }
        else{
            console.log("Condition does not meet for transaction");
        } 
        
        console.log("Loading next loop  .   .    .   .    .   .    .    .   .    .   .    .   .");
    });
}


//app.get('/', (req, res) => res.send("Hi WEB"))
//app.get('/getWallet', db.getWallet)
//app.get('/allTransaction', db.allTransaction)

const PORT = 3000;
server.listen(PORT, async function () {
    console.log("Server Started on Port " + PORT);
});

init().then(async () => { console.log('Bot is getting started......'); });

async function triggerWebSocketTransaction(){
    const allTransaction = await db.allTransactions()
    webSocketTransaction.send(JSON.stringify(allTransaction))
}
async function triggerWebSocketWallet(){
    const wallet = await db.lastTransaction()
    webSocketWallet.send(JSON.stringify(wallet))
}
wss_transactions.on('connection',async function connection(ws_transactions){
    webSocketTransaction = ws_transactions
    console.log('WebSocketClient of transactions is connected!');
    await triggerWebSocketTransaction()
})

wss_wallet.on('connection',async function connection(ws_wallet){
    webSocketWallet = ws_wallet
    console.log('WebSocketClient of wallet is connected!');
    await triggerWebSocketWallet()
})
