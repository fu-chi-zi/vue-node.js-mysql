const mysql = require('mysql2');
const db =mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password :'Yy18716186637',
    database :'dudainfo'
});
db.connect();
module .exports = db;