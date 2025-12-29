const express = require("express");
const router = express.Router();
const db = require("../db/index.js");
// 获取用户列表
router.get("/user", (req, res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "获取用户成功", code: 200 });
  });
});
//书籍列表
router.get("/book", (req, res) => {
  const sql = "SELECT * FROM book";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "获取用户成功", code: 200 });
  });
});

//删除书籍信息

router.get("/deleteBook", (req, res) => {
  const sql = "delete FROM book where id=?";
  let { id } = req.query;
  let params = [Number(id)];
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "删除书籍成功", code: 200 });
  });
});
//添加书籍信息
router.post("/addBook", (req, res) => {
  const sql =
    "insert into book (book_no,book_name,author,category,price,book_img,book_status) values (?,?,?,?,?,?,?)";
  let { book_no, book_name, author, category, price, book_img } = req.query;
  let params = [book_no, book_name, author, category, price, book_img, 0];
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "添加书籍成功", code: 200 });
  });
});

//改变书籍状态
router.get("/changeBook", (req, res) => {
    
    
    const sql = "UPDATE book SET book_status = ? WHERE id = ?";
    let { book_status, id } = req.query;
    let params = [Number(book_status),id];
    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.send({ status: 0, data: results, message: "借出书籍成功", code: 200 });
    });
});

//获取借书记录

router.get("/bookBorrow", (req, res) => {
  const sql = "SELECT * FROM book_borrow";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "获取借书记录成功", code: 200 });
  });
});

//借书时学生登记

router.get("/lendingStudent", (req, res) => {
 // 获取当前时间并格式化为 "YYYY-MM-DD HH:MM:SS"
  const now = new Date();
const localString = now.toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).replace(/\//g, '-');  // "2024-01-15 16:30:00"

  const sql = "insert into book_borrow (student_no,class_name,student_name,borrow_time,book_info) values (?,?,?,?,?)";
  let { student_no,class_name,student_name,book_info } = req.query;
  let params = [student_no,class_name,student_name,localString,book_info];
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "借出书籍,学生登记成功", code: 200 });
  });
});

//学生归还书籍


router.get("/dueStudent", (req, res) => {
 // 获取当前时间并格式化为 "YYYY-MM-DD HH:MM:SS"
  const now = new Date();
const localString = now.toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).replace(/\//g, '-');  // "2024-01-15 16:30:00"

  const sql = "UPDATE book_borrow SET return_time = ? WHERE id = ?";
  let { id } = req.query;
  let params = [localString,id];
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "归还书籍,学生登记成功", code: 200 });
  });
});


//通过名字查询书籍
router.get("/searchBook", (req, res) => {
  const sql = "SELECT * FROM book where book_name like ?"; 
  let { book_name } = req.query;
  let params = [`%${book_name}%`];  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "查询书籍成功", code: 200 });
  });
});

//获取读者信息

router.get("/student", (req, res) => {
  const sql = "SELECT * FROM student";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.send({ status: 0, data: results, message: "获取用户成功", code: 200 });
  });
});
module.exports = router;
