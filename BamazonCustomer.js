// SETUP: make connection to mysql, inquirer and dotenv(for password passing)
var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config()
var password = process.env.password

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: password,
    database: "Bamazon"
});
var orderTotal //global variable to keep track of order total to display at the end of the order
    // connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    start();
});

// FUNCTION start - display initial catalog and initiate the shopping process
var start = function() {
    // begin by traversing the database and loading information for display
    // database schema follows:
    // CREATE TABLE products (
    //   item_id INT NOT NULL AUTO_INCREMENT,
    //   product_name VARCHAR(45) NULL,
    //   department_name VARCHAR(45) NULL,
    //   price DECIMAL(10,2) NULL,
    //   stock_quantity INT NULL,
    //   PRIMARY KEY (item_id)
    // );
    orderTotal = 0;
    console.log("\nWELCOME TO BAMAZON!  SELECT YOUR PURCHASE FROM THE ITEMS BELOW:\n");
    connection.query("SELECT * FROM products ORDER BY department_name", function(err, res) {
        var currDept = "";
        for (var i = 0; i < res.length; i++) {
            if (currDept !== res[i].department_name) {
                currDept = res[i].department_name;
                console.log("\nDEPARTMENT : " + currDept + "\nITEM #|PRODUCT NAME                         | PRICE      |QTY OH")
            }
            // "pretify" before displaying so everything lines up
            var fancyItem = res[i].item_id + "     "
            fancyItem = fancyItem.substring(0, 5)
            var fancyPrice = "$" + res[i].price.toFixed(2) + "          "
            fancyPrice = fancyPrice.substring(0, 10)
            var fancyName = res[i].product_name + "                              "
            fancyName = fancyName.substring(0, 35)
            console.log(fancyItem + " | " + fancyName + " | " + fancyPrice + " | " + res[i].stock_quantity);
        }
        console.log("-----------------------------------\n\n");
        custPurch(false); //begins the shopping prompt process; passing 'false' will control the initial message
    })
}

// FUNCTION custPurch - prompts the user through the buying process
var custPurch = function(another) {
        var promptMessage = "Order an item?"
        if (another) {
            promptMessage = "Order another item?"
        }
        inquirer.prompt([{
            type: "confirm",
            message: promptMessage,
            name: "continue",
            default: true
        }]).then(function(answers) {
            if (answers.continue) { //code within this if will execute if the customer desires to order a product

                inquirer.prompt([{
                    name: "item",
                    type: "input",
                    message: "What is the item you would like to purchase?"
                }, {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?",
                    validate: function(value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }]).then(function(answer) { //refresh with the latest catalog - all items
                    connection.query("SELECT * FROM products ORDER BY department_name", function(err, res) {
                        var chosenItem = null;
                        for (var i = 0; i < res.length; i++) { //search for item the customer has selected
                            if (res[i].item_id === parseInt(answer.item)) {
                                chosenItem = res[i];
                            }
                        }
                        var updateDatabase = true; //toggle used to update the DB or not depending on stock situation
                        if (chosenItem) { // if the item exists execute the code below
                            orderQty = parseInt(answer.quantity)
                            if (chosenItem.stock_quantity == 0) {
                                console.log("\n\nSORRY, WE ARE OUT OF STOCK ON THAT ITEM\n\n")
                                updateDatabase = false //DB will not be updated 
                            } else {
                                var newQty = chosenItem.stock_quantity - orderQty;
                                if (newQty < 0) { //check if there is enough stock
                                    console.log("\n\nSORRY, WE DO NOT HAVE ENOUGH STOCK ON THAT ITEM TO FULFILL YOUR REQUESTED QUANTITY - WE WILL SHIP " + chosenItem.stock_quantity + " UNITS AND BACKORDER THE REMAINING")
                                    orderQty = chosenItem.stock_quantity
                                    newQty = 0;
                                }
                            }
                            var orderCost = orderQty * chosenItem.price

                            //update the DB with the new quantity OR bypass the update
                            if (updateDatabase) {
                                connection.query("UPDATE products SET ? WHERE ?", [{
                                    stock_quantity: newQty
                                }, {
                                    item_id: answer.item
                                }], function(error) {
                                    if (error) throw err;
                                    console.log("\n\n\x1b[1mOrder placed: " + chosenItem.product_name + ", " + orderQty + " @ $" + chosenItem.price + " totalling $" + orderCost.toFixed(2) + "\n\n");
                                    orderTotal += orderCost
                                    custPurch(true);
                                });
                            } else {
                                custPurch(true);
                            }
                        } else { //matching else if the item is NOT found
                            console.log("\n\n\x1b[5mSORRY, WE DO NOT HAVE THAT ITEM\n\n")
                            custPurch(true);
                        }
                    })
                });
            } else { //code to execute if the user has completed their shopping 
                console.log("\n\n\x1b[1mTHANK YOU FOR YOUR BUSINESS!!!!\n");
                console.log("\n\n\x1b[41mYOUR TOTAL ORDER COST IS $" + orderTotal.toFixed(2));
                connection.end()
                return;
            }
        })
    }
    //initiate the program
    // BgRed = "\x1b[41m"
