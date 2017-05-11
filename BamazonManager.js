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

// database schema follows:
// CREATE TABLE products (
//   item_id INT NOT NULL AUTO_INCREMENT,
//   product_name VARCHAR(45) NULL,
//   department_name VARCHAR(45) NULL,
//   price DECIMAL(10,2) NULL,
//   stock_quantity INT NULL,
//   PRIMARY KEY (item_id)
// );
// display menu and execute funtions accordingly
var start = function() {
    inquirer.prompt({
        name: "menuSelection",
        type: "rawlist",
        message: "Select from the menu below:",
        choices: ["VIEW ALL PRODUCTS", "VIEW LOW INVENTORY ITEMS", "ADD INVENTORY TO STOCK", "ADD NEW PRODUCT TO STORE", "QUIT"]
    }).then(function(answer) {
        switch (answer.menuSelection.toUpperCase()) {   
            case "VIEW ALL PRODUCTS":
                viewAllProducts();
                break; 
            case   "VIEW LOW INVENTORY ITEMS":
                viewLowInventory();
                break;
            case "ADD INVENTORY TO STOCK":
                addInventory();
                break;
            case "ADD NEW PRODUCT TO STORE":
                addNewProduct();
                break;
            case "QUIT":
                connection.end()
                break;
        }
    })

}
var viewAllProducts = function() {

    console.log("\nVIEW ALL PRODUCTS:\n");
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
        start();     
    })  
}
var viewLowInventory = function() {

    console.log("\nVIEW LOW INVENTORY PRODUCTS:\n");
    connection.query("SELECT * FROM products WHERE stock_quantity < 6 ORDER BY department_name", function(err, res) {
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
        start();     
    })  
}
var addInventory = function() {
    // prompt for info about the item being put up for auction
    var currStockQty;
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "What is the item ID of the product?"
    }, {
        name: "quantity",
        type: "input",
        message: "Enter the amount of stock to add (can be negative if adjustment):",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    }]).then(function(answer) {
        //do SELECT to determine current inventory (stock_quantity) for item selected before adding stock quantity to it

        connection.query("SELECT `stock_quantity` FROM `products` WHERE ?", [{
            item_id: parseInt(answer.item)
        }], function(error, res) {
            if (error) throw error;
            currStockQty = res[0].stock_quantity;
            var newQty = currStockQty + parseInt(answer.quantity);
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newQty
            }, {
                item_id: parseInt(answer.item)
            }], function(error) {
                if (error) throw err;
                console.log("\n\n\x1b[1mInventory updated successfully!\n\n");
                start();
            });
        })
    });
};
var addNewProduct = function() {
    inquirer.prompt([{
            name: "productName",
            type: "input",
            message: "What is the name of the product?"
        }, {
            name: "deptName",
            type: "input",
            message: "What is the department name?"
        }, {
            name: "prodPrice",
            type: "input",
            message: "What is the price?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },

        {
            name: "quantity",
            type: "input",
            message: "Enter the amount of stock to add:",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function(answer) {
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.productName,
            department_name: answer.deptName,
            price: parseFloat(answer.prodPrice),
            stock_quantity: parseInt(answer.quantity)
        }, function(err) {
            if (err) throw err;
            console.log("\n\n\x1b[1mInventory item added successfully!\n\n");
            start();
        });
    });
}
