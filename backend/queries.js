const { response, request } = require("express");
const { Pool, Client } = require("pg");
require('dotenv').config({path: './.env'})
var pool

async function connect_database(){
    pool = new Pool({
        user: process.env.User,
        host: process.env.Host,
        database: process.env.Database,
        password: process.env.Password,
        port: process.env.Port,
    })
    pool.connect(async function(err) {
        if (err) throw err;
        console.log("Database Connected!");
    });    
}

async function allTransactions(){
    let data =  await pool.query("SELECT * FROM transaction ORDER BY time_stamp DESC")
    return JSON.stringify(data.rows)
}


async function createLatestPrice(time, price){
    try{
        await pool.query("INSERT INTO prices (time_stamp, price)VALUES("+time+","+price+")")
    }
    catch(err){
        console.log(err);
    }
       
}


async function createOrder(time_stamp, currPrice, trade_amount, trade_value, Order_type, updated_btc, updated_usdt, profitLoss){
    try{
        await pool.query("INSERT INTO transaction (time_stamp, order_type, trade_amount, trade_price, trade_value, updated_btc_inventory, updated_usdt_inventory, profit_loss)VALUES("+time_stamp+","+"\'"+Order_type+"\'"+","+trade_amount+","+currPrice+","+trade_value+","+updated_btc+","+updated_usdt+","+profitLoss+")");
    }
    catch(e){
        console.log(err);
    }
}


async function lastTransaction(){ 
    let data =  await pool.query("SELECT time_stamp, updated_btc_inventory, updated_usdt_inventory, profit_loss FROM transaction ORDER BY time_stamp DESC LIMIT 1") 
    if(data.rows.length == 0){
        await createOrder(0, 0, 0, 0, '-', 1.00, 10000, 0)
        let data =  await pool.query("SELECT time_stamp, updated_btc_inventory, updated_usdt_inventory, profit_loss FROM transaction ORDER BY time_stamp DESC LIMIT 1") 
        return JSON.stringify(data.rows)
    }
    return JSON.stringify(data.rows) 
}


async function findTenMinsPrice(time_stamp){
    let data =  await pool.query('SELECT * FROM prices WHERE time_stamp='+time_stamp)
    return JSON.stringify(data.rows)
}
/*

const getWallet = (request, response)=>{
    pool.query("SELECT time_stamp, updated_btc_inventory, updated_usdt_inventory FROM transaction ORDER BY time_stamp DESC LIMIT 1", (err, res) => {
        if (err) {
          throw err
        }
        response.status(200).json(res.rows);
    })
}
const allTransaction = (request, response)=>{
    pool.query("SELECT * FROM transaction ORDER BY time_stamp DESC", (err, res) => {
        if (err) {
          throw err
        }
        response.status(200).json(res.rows);
    })
}
*/

module.exports = {createOrder, createLatestPrice, allTransactions , connect_database, findTenMinsPrice, lastTransaction}
