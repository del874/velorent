#!/bin/bash
# 数据库查询工具

DB_PATH="dev.db"

echo "=========================================="
echo "  自行车租赁平台 - 数据库查看工具"
echo "=========================================="
echo ""

case "$1" in
  "users")
    echo "=== 用户列表 ==="
    sqlite3 $DB_PATH "SELECT id, name, email, role, createdAt FROM User;"
    ;;

  "bikes")
    echo "=== 车型列表 ==="
    sqlite3 $DB_PATH "SELECT id, name, type, brand, price, available FROM Bike;"
    ;;

  "bookings")
    echo "=== 预订列表 ==="
    sqlite3 $DB_PATH "
      SELECT
        b.id,
        bike.name,
        b.customerName,
        b.startDate,
        b.endDate,
        b.status,
        b.totalPrice
      FROM Booking b
      JOIN Bike bike ON b.bikeId = bike.id
      ORDER BY b.createdAt DESC;"
    ;;

  "stats")
    echo "=== 数据库统计 ==="
    echo "用户数量: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM User;')"
    echo "车型数量: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM Bike;')"
    echo "预订数量: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM Booking;')"
    echo ""
    echo "=== 预订状态分布 ==="
    sqlite3 $DB_PATH "SELECT status, COUNT(*) FROM Booking GROUP BY status;"
    ;;

  "recent")
    echo "=== 最近预订 ==="
    sqlite3 $DB_PATH "
      SELECT
        b.id,
        bike.name,
        b.status,
        b.startDate,
        b.totalPrice
      FROM Booking b
      JOIN Bike bike ON b.bikeId = bike.id
      ORDER BY b.createdAt DESC
      LIMIT 5;"
    ;;

  *)
    echo "用法: npm run db:view [选项]"
    echo ""
    echo "选项:"
    echo "  users    - 查看所有用户"
    echo "  bikes    - 查看所有车型"
    echo "  bookings - 查看所有预订"
    echo "  stats    - 查看统计信息"
    echo "  recent   - 查看最近预订"
    echo ""
    echo "或使用 sqlite3 直接查询:"
    echo "  sqlite3 dev.db '.tables'"
    echo "  sqlite3 dev.db 'SELECT * FROM User;'"
    ;;
esac
