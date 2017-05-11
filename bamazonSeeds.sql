--Create a MySQL Database called Bamazon.
--Then create a Table inside of that database called products.
--The products table should have each of the following columns:--
--item_id (unique id for each product)
--product_name (Name of product)
--department_name
--price (cost to customer)
--price,stock_quantity (how much of the product is available in stores)
--Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).

CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NULL,
  department_name VARCHAR(45) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Firestick","Electronics", 85.99, 1000);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Leisure Spa Renue","Home & Garden", 25.99, 200);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Stevia 1000 pack","Grocery", 25.00, 150);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Flat Panel Screen","Electronics", 150.00,2);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Garden Hose","Home & Garden", 18.99,1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Teff Flower","Grocery", 18.55,10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("A/B Switch","Electronics", 17.99,0);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Fertilizer","Home & Garden", 45.99,5);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Knoll Chicken stock","Grocery",4.55,75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("HDMI Cable","Electronics",25.75, 8);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("How to Program MySQL","Books", 25.99, 25);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Winning Friends and Influencing People","Books", 12.25,1);

-- ### Alternative way to insert more than one row
-- INSERT INTO products (product_name, price, quantity) 
-- VALUES ("vanilla", 2.50, 100), ("chocolate", 3.10, 120), ("strawberry", 3.25, 75);
