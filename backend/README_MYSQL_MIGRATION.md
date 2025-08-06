# MongoDB to MySQL Migration Guide

This guide will help you complete the migration from MongoDB to MySQL for your Lab Inventory Management System.

## Prerequisites

1. **MySQL Server**: Make sure you have MySQL installed and running
2. **Node.js**: Ensure you have Node.js installed
3. **Backup**: Create a backup of your MongoDB data before proceeding

## Step 1: Install MySQL Dependencies

First, install the MySQL dependencies:

```bash
cd backend
npm install mysql2
```

## Step 2: Configure MySQL Database

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE lab_inventory;
   ```

2. **Create MySQL User** (optional but recommended):
   ```sql
   CREATE USER 'lab_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON lab_inventory.* TO 'lab_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Set Environment Variables**:
   Create or update your `.env` file in the backend directory:
   ```env
   # MySQL Configuration
   DB_HOST=localhost
   DB_USER=root  # or your MySQL username
   DB_PASSWORD=your_password
   DB_NAME=lab_inventory
   DB_PORT=3306
   
   # Keep MongoDB URI for migration
   MONGO_URI=mongodb://127.0.0.1:27017/lab_inventory
   
   # Other existing variables...
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

## Step 3: Initialize MySQL Database Schema

The database schema will be automatically created when you start the server. However, you can also run it manually:

```bash
cd backend
node -e "require('./config/database').initializeDatabase().then(() => console.log('Database initialized')).catch(console.error)"
```

## Step 4: Migrate Data from MongoDB to MySQL

Run the migration script to transfer your existing data:

```bash
cd backend
node scripts/migrateToMySQL.js
```

This script will:
- Connect to both MongoDB and MySQL
- Migrate all users, chemicals, glasswares, plasticwares, instruments, miscellaneous items
- Migrate activity logs, lab registers, pending requests, and issued items
- Handle data type conversions and relationships

## Step 5: Update Routes (if needed)

The routes should work with the new MySQL models. However, you may need to update some route files if they use MongoDB-specific features. The main changes are:

- Replace `mongoose` imports with the new model classes
- Update any MongoDB-specific queries to use the new model methods
- Remove any Mongoose-specific middleware or hooks

## Step 6: Test the Application

1. **Start the server**:
   ```bash
   cd backend
   npm start
   ```

2. **Test the API endpoints** to ensure everything is working correctly

3. **Check the database** to verify data migration:
   ```sql
   USE lab_inventory;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM chemicals;
   SELECT COUNT(*) FROM glasswares;
   -- etc.
   ```

## Step 7: Update Frontend (if needed)

The frontend should continue to work as the API endpoints remain the same. However, you may need to update any frontend code that:

- Expects MongoDB ObjectId format (now uses integer IDs)
- Handles date formats differently
- Uses MongoDB-specific features

## Step 8: Clean Up

Once you've verified everything is working correctly:

1. **Remove MongoDB dependencies**:
   ```bash
   npm uninstall mongoose
   ```

2. **Update package.json** to remove mongoose from dependencies

3. **Remove MongoDB connection** from your environment variables

## Troubleshooting

### Common Issues:

1. **Connection Errors**:
   - Ensure MySQL is running
   - Check your database credentials
   - Verify the database exists

2. **Migration Errors**:
   - Check for duplicate entries (unique constraints)
   - Verify data types match the schema
   - Check for null values in required fields

3. **API Errors**:
   - Check the server logs for detailed error messages
   - Verify the routes are using the new models correctly

### Data Verification:

After migration, verify your data integrity:

```sql
-- Check user counts
SELECT COUNT(*) as user_count FROM users;

-- Check chemical counts
SELECT COUNT(*) as chemical_count FROM chemicals;

-- Check for any null values in required fields
SELECT COUNT(*) FROM users WHERE username IS NULL OR email IS NULL;

-- Verify relationships
SELECT COUNT(*) FROM issued_items WHERE issuedToId NOT IN (SELECT id FROM users);
```

## Performance Considerations

1. **Indexes**: The schema includes appropriate indexes for common queries
2. **Connection Pooling**: The MySQL configuration uses connection pooling for better performance
3. **Query Optimization**: Consider adding additional indexes based on your usage patterns

## Backup Strategy

Before and after migration:

1. **MongoDB Backup**:
   ```bash
   mongodump --db lab_inventory --out ./backup/mongodb
   ```

2. **MySQL Backup**:
   ```bash
   mysqldump -u root -p lab_inventory > ./backup/mysql/lab_inventory.sql
   ```

## Rollback Plan

If you need to rollback:

1. **Stop the application**
2. **Restore MongoDB data** from backup
3. **Revert code changes** to use MongoDB models
4. **Restart with MongoDB configuration**

## Support

If you encounter issues during migration:

1. Check the server logs for detailed error messages
2. Verify database connectivity
3. Test individual components step by step
4. Consider running the migration in a test environment first

## Benefits of MySQL Migration

1. **ACID Compliance**: Better data consistency
2. **Structured Queries**: More powerful querying capabilities
3. **Better Performance**: Optimized for relational data
4. **Easier Maintenance**: Standard SQL operations
5. **Better Integration**: Works well with other enterprise systems 