
ALTER USER 'root' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO 'root' WITH GRANT OPTION;
FLUSH PRIVILEGES;