# Master Admin Functionality

## Overview
The Master Admin is the highest level administrator in the Biomedical Science Laboratory Management System. This role has complete control over all user accounts and system management.

## Master Admin Privileges

### 🔐 Account Management
- **Create any type of account**: Master admin can create admin, faculty, student, PhD scholar, and dissertation student accounts
- **Change any user's password**: Master admin can reset passwords for any user account
- **Delete any user account**: Master admin can delete any user except other master admins
- **View all users**: Complete visibility of all user accounts in the system
- **Update user details**: Modify user information including role, email, name, etc.

### 📊 System Statistics
- View total user count
- View user distribution by role
- Monitor recent user registrations
- Access system-wide analytics

### 🔧 System Access
- Access to all admin dashboard features
- Full inventory management capabilities
- Complete system control and oversight

## Setup Instructions

### 1. Update Database Schema
First, update your database to include the master_admin role:

```bash
cd backend
node scripts/updateDatabaseForMasterAdmin.js
```

### 2. Create Master Admin Account
Create your master admin account:

```bash
cd backend
node scripts/createMasterAdmin.js
```

This will create a master admin with these default credentials:
- **Username**: master_admin
- **Password**: MasterAdmin@2024
- **Email**: master.admin@nuv.ac.in
- **Full Name**: Master Administrator

### 3. Login and Access
1. Start your application
2. Navigate to the login page
3. Use the master admin credentials to login
4. You'll be redirected to the Master Admin Dashboard

## Master Admin Dashboard Features

### 📈 Statistics Overview
- Total users count
- User distribution by role (Admin, Faculty, Student, etc.)
- Recent user activity

### 👥 User Management
- **View All Users**: Complete list of all system users
- **Create New User**: Form to create any type of user account
- **Change Password**: Reset any user's password
- **Delete User**: Remove user accounts (except master admins)
- **User Details**: View comprehensive user information

### 🎛️ Quick Actions
- **Create New User**: Open user creation form
- **Admin Dashboard**: Access regular admin features
- **Inventory Management**: Access inventory management

## API Endpoints

### Master Admin Routes (`/api/master-admin`)

#### GET `/users`
- **Description**: Get all users in the system
- **Access**: Master Admin only
- **Response**: Array of user objects (passwords excluded)

#### GET `/users/role/:role`
- **Description**: Get users filtered by role
- **Access**: Master Admin only
- **Parameters**: role (admin, faculty, student, etc.)
- **Response**: Array of user objects

#### POST `/create-user`
- **Description**: Create a new user account
- **Access**: Master Admin only
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "admin|faculty|student|phd_scholar|dissertation_student",
    "email": "string",
    "fullName": "string",
    "rollNo": "string (optional)",
    "category": "UG/PG|PhD|Project Student"
  }
  ```

#### PATCH `/users/:id/change-password`
- **Description**: Change a user's password
- **Access**: Master Admin only
- **Body**: 
  ```json
  {
    "newPassword": "string"
  }
  ```

#### PATCH `/users/:id`
- **Description**: Update user details
- **Access**: Master Admin only
- **Body**: Any user fields to update

#### DELETE `/users/:id`
- **Description**: Delete a user account
- **Access**: Master Admin only
- **Note**: Cannot delete master admin accounts

#### GET `/statistics`
- **Description**: Get system statistics
- **Access**: Master Admin only
- **Response**: 
  ```json
  {
    "totalUsers": number,
    "byRole": {
      "master_admin": number,
      "admin": number,
      "faculty": number,
      "student": number,
      "phd_scholar": number,
      "dissertation_student": number
    },
    "recentUsers": number
  }
  ```

## Security Features

### 🔒 Password Management
- All passwords are hashed using bcrypt
- Master admin can reset any user's password
- Password change notifications are sent via email
- Users are encouraged to change default passwords

### 🛡️ Access Control
- Master admin routes are protected with JWT authentication
- Role-based authorization ensures only master admins can access
- Master admins cannot delete other master admin accounts
- All actions are logged for audit purposes

### 📧 Email Notifications
- Welcome emails sent to new users with credentials
- Password change notifications sent to users
- Email service integration for automated communications

## User Roles Hierarchy

```
Master Admin (👑)
├── Admin
├── Faculty
├── Student
├── PhD Scholar
└── Dissertation Student
```

## Best Practices

### 🔐 Security
1. **Change Default Password**: Always change the default master admin password after first login
2. **Strong Passwords**: Use strong passwords for all accounts
3. **Regular Audits**: Regularly review user accounts and permissions
4. **Secure Access**: Ensure master admin credentials are kept secure

### 👥 User Management
1. **Verify Information**: Always verify user information before creating accounts
2. **Role Assignment**: Assign appropriate roles based on user responsibilities
3. **Password Policies**: Encourage users to change default passwords
4. **Account Cleanup**: Regularly review and clean up inactive accounts

### 📊 Monitoring
1. **System Statistics**: Regularly check system statistics
2. **User Activity**: Monitor user registration and activity patterns
3. **Error Logs**: Review error logs for any issues
4. **Backup**: Ensure regular database backups

## Troubleshooting

### Common Issues

#### Database Schema Update Fails
- Ensure MySQL server is running
- Check database connection settings
- Verify user has ALTER TABLE permissions

#### Master Admin Creation Fails
- Check if master admin already exists
- Verify database connection
- Ensure all required fields are provided

#### Login Issues
- Verify master admin credentials
- Check JWT token configuration
- Ensure frontend is properly configured

#### Email Notifications Not Working
- Check email service configuration
- Verify SMTP settings
- Review email service logs

## Support

For issues related to master admin functionality:
1. Check the application logs
2. Verify database connectivity
3. Review API endpoint responses
4. Contact system administrator

---

**Note**: Master Admin functionality provides complete system control. Use these privileges responsibly and ensure proper security measures are in place. 