/*
 Navicat Premium Dump SQL

 Source Server         : node
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : dudainfo

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 29/12/2025 00:21:52
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图书主键ID（自增唯一标识）',
  `book_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '图书编号（唯一，如ISBN）',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '书名',
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '作者',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '图书分类',
  `price` decimal(10, 2) NOT NULL COMMENT '图书价格（保留2位小数，避免精度丢失）',
  `book_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '图书图片路径/URL（默认空字符串）',
  `book_status` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '图书状态：0=在库，1=已借出，2=下架',
  `lending_time` datetime NULL DEFAULT NULL COMMENT '借出时间（未借出则为NULL）',
  `due_time` datetime NULL DEFAULT NULL COMMENT '应还时间（未借出则为NULL）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_book_no`(`book_no` ASC) USING BTREE COMMENT '图书编号唯一索引，防止重复录入',
  INDEX `idx_book_name`(`book_name` ASC) USING BTREE COMMENT '书名索引，提升查询效率',
  INDEX `idx_category`(`category` ASC) USING BTREE COMMENT '分类索引，便于按分类筛选图书'
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书信息表（含分类字段）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of book
-- ----------------------------
INSERT INTO `book` VALUES (1, 'ISBN9787020002207', '红楼梦', '曹雪芹', '古典名著', 59.70, 'https://bkimg.cdn.bcebos.com/pic/d1160924ab18972bd40794bac0816c899e510fb39c25?x-bce-process=image/format,f_auto/watermark,image_d2F0ZXIvYmFpa2UyNzI,g_7,xp_5,yp_5,P_20/resize,m_lfit,limit_1,h_1080', 0, '2025-12-28 17:18:18', '2025-12-28 17:23:33', '2025-12-27 23:18:44', '2025-12-28 17:23:33');
INSERT INTO `book` VALUES (3, 'ISBN9787020002214', '水浒传', '施耐庵', '古典名著', 55.00, 'https://bkimg.cdn.bcebos.com/pic/908fa0ec08fa513d2697efc05f3642fbb2fb43167323?x-bce-process=image/format,f_auto/watermark,image_d2F0ZXIvYmFpa2UyNzI,g_7,xp_5,yp_5,P_20/resize,m_lfit,limit_1,h_1080', 0, NULL, NULL, '2025-12-27 23:18:44', '2025-12-27 23:18:44');
INSERT INTO `book` VALUES (28, 'ISBN77840474439451', '朝花夕拾', '鲁迅', '散文集', 29.90, 'https://pic.arkread.com/cover/ebook/f/434328855.1686022830.jpg!cover_default.jpg', 0, NULL, NULL, '2025-12-28 16:54:58', '2025-12-28 16:54:58');

-- ----------------------------
-- Table structure for book_borrow
-- ----------------------------
DROP TABLE IF EXISTS `book_borrow`;
CREATE TABLE `book_borrow`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '借阅记录唯一ID',
  `student_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '学生学号（如：2023010101）',
  `class_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '学生班级（如：前端2301班）',
  `student_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '学生姓名',
  `borrow_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '借书时间，默认当前时间',
  `return_time` datetime NULL DEFAULT NULL COMMENT '归还时间，未归还则为NULL',
  `book_info` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '借阅书籍（可填写书名+ISBN，如：《MySQL从入门到精通》9787115546345）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_student_no`(`student_no` ASC) USING BTREE,
  INDEX `idx_class_name`(`class_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书借阅信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of book_borrow
-- ----------------------------
INSERT INTO `book_borrow` VALUES (1, '20230001', '张三', '计算机科学与技术1班', '2025-12-18 22:37:00', '2025-12-28 23:02:27', 'Java编程思想');
INSERT INTO `book_borrow` VALUES (2, '20230005', '网络安全2班', '钱七', '2025-12-28 22:58:36', NULL, '算法导论');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户主键ID（自增）',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户密码',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC) USING BTREE COMMENT '用户名唯一索引，避免重复创建相同用户名'
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '123456', '2025-12-27 22:42:00', '2025-12-27 22:42:00');

SET FOREIGN_KEY_CHECKS = 1;
