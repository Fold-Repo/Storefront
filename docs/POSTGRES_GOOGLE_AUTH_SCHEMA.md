# PostgreSQL Schema for Google Authentication

## Important: Do NOT Store JWT Tokens in Database

**JWT tokens should NOT be stored in your database** because:
- JWTs are stateless and contain all necessary information
- Tokens expire frequently (every 24 hours in our case)
- Storing tokens defeats the purpose of stateless authentication
- It's a security risk if the database is compromised
- Tokens are generated on-demand and returned to the client

## What You SHOULD Store

1. **Firebase UID** - To link Firebase account to your user
2. **Refresh Tokens** (Optional) - Only if you need token revocation
3. **Token Blacklist** (Optional) - For logout functionality

## PostgreSQL Schema

### 1. Users Table

```sql
-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    phone VARCHAR(20),
    altphone VARCHAR(20),
    position VARCHAR(100),
    is_verify BOOLEAN DEFAULT false,
    role_id INTEGER REFERENCES roles(role_id),
    business_id INTEGER REFERENCES businesses(business_id),
    store_id INTEGER REFERENCES stores(store_id),
    
    -- Google/Firebase specific fields
    firebase_uid VARCHAR(255) UNIQUE, -- Store Firebase UID, not token
    auth_provider VARCHAR(50) DEFAULT 'email', -- 'email' or 'google'
    profile_picture TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on firebase_uid for faster lookups
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Create index on email
CREATE INDEX idx_users_email ON users(email);
```

### 2. Refresh Tokens Table (Optional - Only if you need token revocation)

```sql
-- Only create this if you want to implement token revocation
CREATE TABLE refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false,
    
    -- Index for faster lookups
    CONSTRAINT unique_active_token UNIQUE (user_id, refresh_token)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(refresh_token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### 3. Token Blacklist Table (Optional - For logout functionality)

```sql
-- Only create this if you want to blacklist tokens on logout
CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- Hash of the JWT token
    user_id INTEGER REFERENCES users(user_id),
    expires_at TIMESTAMP NOT NULL, -- When the token naturally expires
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_blacklist_hash ON token_blacklist(token_hash);
CREATE INDEX idx_token_blacklist_expires ON token_blacklist(expires_at);

-- Cleanup expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM token_blacklist WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

## Node.js Implementation with PostgreSQL

### Using pg (node-postgres)

```javascript
const { Pool } = require('pg');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/**
 * Google Signup/Login Handler
 * This handles both signup (if user doesn't exist) and login (if user exists)
 */
async function handleGoogleAuth(idToken, email) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Step 1: Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      throw new Error('Invalid Firebase token');
    }

    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email || email;
    const firebaseName = decodedToken.name || '';
    const firebasePicture = decodedToken.picture || null;

    // Step 2: Check if user exists by email or firebase_uid
    const userCheckQuery = `
      SELECT user_id, email, firebase_uid, firstname, lastname, 
             role_id, business_id, store_id, is_verify
      FROM users 
      WHERE email = $1 OR firebase_uid = $2
    `;
    
    const userResult = await client.query(userCheckQuery, [firebaseEmail, firebaseUid]);
    let user = userResult.rows[0];

    // Step 3: If user doesn't exist, create new user (SIGNUP)
    if (!user) {
      const nameParts = firebaseName.split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      // Create user
      const insertUserQuery = `
        INSERT INTO users (
          email, firstname, lastname, firebase_uid, 
          auth_provider, profile_picture, is_verify, role_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_id, email, firstname, lastname, role_id, business_id, store_id
      `;

      const newUserResult = await client.query(insertUserQuery, [
        firebaseEmail,
        firstname,
        lastname,
        firebaseUid,
        'google',
        firebasePicture,
        true, // Google users are pre-verified
        2 // Default role_id (business) - adjust as needed
      ]);

      user = newUserResult.rows[0];

      // Optionally create default business
      const businessQuery = `
        INSERT INTO businesses (businessname, businesstype, user_id)
        VALUES ($1, $2, $3)
        RETURNING business_id
      `;
      
      const businessResult = await client.query(businessQuery, [
        `${firstname}'s Business`,
        'Retail',
        user.user_id
      ]);

      // Update user with business_id
      await client.query(
        'UPDATE users SET business_id = $1 WHERE user_id = $2',
        [businessResult.rows[0].business_id, user.user_id]
      );

      user.business_id = businessResult.rows[0].business_id;
    } else {
      // Step 4: User exists - UPDATE (LOGIN)
      // Update firebase_uid if not set
      if (!user.firebase_uid) {
        await client.query(
          'UPDATE users SET firebase_uid = $1, auth_provider = $2 WHERE user_id = $3',
          [firebaseUid, 'google', user.user_id]
        );
      }

      // Update profile picture if available and not set
      if (firebasePicture && !user.profile_picture) {
        await client.query(
          'UPDATE users SET profile_picture = $1 WHERE user_id = $2',
          [firebasePicture, user.user_id]
        );
      }
    }

    // Step 5: Load full user data with relations
    const fullUserQuery = `
      SELECT 
        u.user_id, u.email, u.firstname, u.lastname, u.phone, u.altphone,
        u.position, u.is_verify, u.created_at, u.role_id, u.business_id, u.store_id,
        r.role_id, r.name as role_name, r.description as role_description,
        b.business_id, b.businessname, b.businesstype, b.tin, b.website,
        b.business_registration_number, b.product_service, b.product_description,
        a.address_id, a.addressline1, a.addressline2, a.addressline3,
        a.city, a.country, a.postcode
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN businesses b ON u.business_id = b.business_id
      LEFT JOIN addresses a ON u.user_id = a.user_id
      WHERE u.user_id = $1
    `;

    const fullUserResult = await client.query(fullUserQuery, [user.user_id]);
    const fullUser = fullUserResult.rows[0];

    // Step 6: Generate JWT tokens (DO NOT STORE IN DATABASE)
    const tokenPayload = {
      user_id: fullUser.user_id,
      email: fullUser.email,
      firstname: fullUser.firstname,
      lastname: fullUser.lastname,
      role_id: fullUser.role_id,
      business_id: fullUser.business_id,
      store_id: fullUser.store_id
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const refreshToken = jwt.sign(
      { user_id: fullUser.user_id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Step 7: Optionally store refresh token (if you want revocation)
    // Only if you created the refresh_tokens table
    if (process.env.STORE_REFRESH_TOKENS === 'true') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await client.query(
        `INSERT INTO refresh_tokens (user_id, refresh_token, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, refresh_token) DO NOTHING`,
        [fullUser.user_id, refreshToken, expiresAt]
      );
    }

    await client.query('COMMIT');

    // Step 8: Format response
    return {
      status: 200,
      data: {
        token: token, // Return to client, DO NOT store in DB
        refreshToken: refreshToken, // Return to client, optionally store in DB
        user: {
          user_id: fullUser.user_id,
          firstname: fullUser.firstname,
          lastname: fullUser.lastname,
          email: fullUser.email,
          phone: fullUser.phone,
          altphone: fullUser.altphone,
          position: fullUser.position,
          isVerify: fullUser.is_verify,
          created_at: fullUser.created_at,
          role: fullUser.role_name ? {
            role_id: fullUser.role_id,
            name: fullUser.role_name,
            description: fullUser.role_description
          } : null,
          business: fullUser.business_id ? {
            business_id: fullUser.business_id,
            businessname: fullUser.businessname,
            businesstype: fullUser.businesstype,
            tin: fullUser.tin,
            website: fullUser.website,
            business_registration_number: fullUser.business_registration_number,
            product_service: fullUser.product_service,
            product_description: fullUser.product_description
          } : null,
          address: fullUser.address_id ? {
            address_id: fullUser.address_id,
            addressline1: fullUser.addressline1,
            addressline2: fullUser.addressline2,
            addressline3: fullUser.addressline3,
            city: fullUser.city,
            country: fullUser.country,
            postcode: fullUser.postcode
          } : null,
          role_id: fullUser.role_id,
          business_id: fullUser.business_id,
          store_id: fullUser.store_id
        }
      }
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Express route
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { idToken, email, provider } = req.body;

    if (provider === 'google') {
      const result = await handleGoogleAuth(idToken, email);
      return res.json(result);
    }

    // Handle regular email/password login
    // ... your existing logic
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Authentication failed',
      message: error.message
    });
  }
});
```

### Using Sequelize ORM

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

// User Model
const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  firstname: DataTypes.STRING(100),
  lastname: DataTypes.STRING(100),
  phone: DataTypes.STRING(20),
  altphone: DataTypes.STRING(20),
  position: DataTypes.STRING(100),
  is_verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  firebase_uid: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true
  },
  auth_provider: {
    type: DataTypes.STRING(50),
    defaultValue: 'email'
  },
  profile_picture: DataTypes.TEXT,
  role_id: DataTypes.INTEGER,
  business_id: DataTypes.INTEGER,
  store_id: DataTypes.INTEGER
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Google Auth Handler with Sequelize
async function handleGoogleAuth(idToken, email) {
  // Verify Firebase token
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const firebaseUid = decodedToken.uid;
  const firebaseEmail = decodedToken.email || email;
  const firebaseName = decodedToken.name || '';
  const firebasePicture = decodedToken.picture || null;

  // Find or create user
  const [user, created] = await User.findOrCreate({
    where: {
      [sequelize.Op.or]: [
        { email: firebaseEmail },
        { firebase_uid: firebaseUid }
      ]
    },
    defaults: {
      email: firebaseEmail,
      firstname: firebaseName.split(' ')[0] || '',
      lastname: firebaseName.split(' ').slice(1).join(' ') || '',
      firebase_uid: firebaseUid,
      auth_provider: 'google',
      profile_picture: firebasePicture,
      is_verify: true,
      role_id: 2
    }
  });

  // Update firebase_uid if user existed but didn't have it
  if (!created && !user.firebase_uid) {
    user.firebase_uid = firebaseUid;
    user.auth_provider = 'google';
    if (firebasePicture && !user.profile_picture) {
      user.profile_picture = firebasePicture;
    }
    await user.save();
  }

  // Load user with relations
  const fullUser = await User.findByPk(user.user_id, {
    include: [
      { model: Business, as: 'business' },
      { model: Role, as: 'role' },
      { model: Address, as: 'address' }
    ]
  });

  // Generate tokens (DO NOT STORE IN DATABASE)
  const token = jwt.sign(
    {
      user_id: fullUser.user_id,
      email: fullUser.email,
      firstname: fullUser.firstname,
      lastname: fullUser.lastname,
      role_id: fullUser.role_id,
      business_id: fullUser.business_id,
      store_id: fullUser.store_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { user_id: fullUser.user_id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return {
    status: 200,
    data: {
      token, // Return to client
      refreshToken, // Return to client
      user: fullUser.toJSON()
    }
  };
}
```

## Summary

### ✅ DO Store:
- **Firebase UID** (`firebase_uid`) - Links Firebase account to your user
- **Auth Provider** (`auth_provider`) - Tracks if user signed up with Google or email
- **Profile Picture** - From Google account
- **Refresh Tokens** (Optional) - Only if you need token revocation

### ❌ DO NOT Store:
- **JWT Access Tokens** - These are stateless and generated on-demand
- **Firebase ID Tokens** - These expire quickly and are only for verification

### Flow:
1. User signs up/logs in with Google → Frontend gets Firebase ID token
2. Frontend sends Firebase ID token to backend
3. Backend verifies token and checks/creates user in PostgreSQL
4. Backend generates JWT token (NOT stored in DB)
5. Backend returns JWT token to frontend
6. Frontend stores token in localStorage/cookies
7. Frontend uses token for authenticated API calls

The token is generated fresh on each login and returned to the client. The client stores it and sends it with each request. The backend validates it without needing to look it up in the database.
