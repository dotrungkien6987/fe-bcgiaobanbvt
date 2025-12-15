# 🛡️ Express Rate Limit - Complete Guide

> API Rate Limiting để protect backend khỏi abuse & DDoS attacks

## 📋 Quick Overview

**express-rate-limit** là middleware cho Express.js giúp limit số requests từ một IP trong khoảng thời gian nhất định.

**Version hiện tại**: `^8.2.1` (trong package.json)

### ⚡ Quick Start

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Apply to all routes
app.use(limiter);
```

---

## 📦 Installation

Đã có trong project (`giaobanbv-be/package.json`):

```json
{
  "dependencies": {
    "express-rate-limit": "^8.2.1"
  }
}
```

Nếu chưa cài:

```bash
cd d:\project\webBV\giaobanbv-be
npm install express-rate-limit
```

---

## 🎯 Basic Usage

### Global Rate Limiter

**File**: `giaobanbv-be/app.js` hoặc `middlewares/rateLimiter.js`

```javascript
const rateLimit = require("express-rate-limit");

// Create limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP per 15 minutes
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply globally
app.use("/api/", globalLimiter);
```

### Route-Specific Rate Limiters

```javascript
// Strict limiter cho login (prevent brute-force)
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 login attempts per hour
  message: {
    success: false,
    message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 1 giờ.",
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Apply to login route
app.post("/api/auth/login", loginLimiter, authController.login);

// Moderate limiter cho public APIs
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 requests per minute
  message: {
    success: false,
    message: "Vui lòng giảm tần suất truy cập.",
  },
});

app.use("/api/public/", publicLimiter);

// Lenient limiter cho authenticated users
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute for logged-in users
});

app.use("/api/protected/", authenticate, authLimiter);
```

---

## 🎛️ Configuration Options

### Complete Options Reference

```javascript
const limiter = rateLimit({
  // ========== REQUIRED ==========

  windowMs: 15 * 60 * 1000, // Time window (milliseconds)
  max: 100, // Max requests per window

  // ========== RESPONSE ==========

  message: "Too many requests", // Error message (string hoặc object)

  statusCode: 429, // HTTP status code when limit exceeded

  // ========== HEADERS ==========

  standardHeaders: true, // Return RateLimit-* headers (draft-6)
  // RateLimit-Limit: 100
  // RateLimit-Remaining: 50
  // RateLimit-Reset: 1234567890

  legacyHeaders: false, // Disable X-RateLimit-* headers

  // ========== BEHAVIOR ==========

  skipSuccessfulRequests: false, // Don't count successful requests (2xx, 3xx)
  skipFailedRequests: false, // Don't count failed requests (4xx, 5xx)

  requestWasSuccessful: (req, res) => res.statusCode < 400, // Custom success check

  skip: (req, res) => {
    // Skip rate limiting for certain requests
    return req.ip === "127.0.0.1"; // Don't limit localhost
  },

  // ========== KEY GENERATION ==========

  keyGenerator: (req, res) => {
    // Custom key (default: req.ip)
    return req.user?.id || req.ip; // Limit by user ID nếu có
  },

  // ========== STORE ==========

  store: undefined, // Default: MemoryStore (in-process)
  // For production: use external store (Redis, Memcached)

  // ========== HANDLERS ==========

  handler: (req, res, next, options) => {
    // Custom handler when limit exceeded
    res.status(options.statusCode).json({
      success: false,
      message: options.message,
      retryAfter: res.getHeader("Retry-After"),
    });
  },

  onLimitReached: (req, res, options) => {
    // Callback when limit first reached
    console.warn(`Rate limit reached for IP: ${req.ip}`);
    // Send alert, log to monitoring, etc.
  },

  // ========== VALIDATION ==========

  validate: {
    xForwardedForHeader: true, // Validate X-Forwarded-For header
    trustProxy: true, // Trust proxy headers
  },
});
```

---

## 📐 Configuration Patterns

### Pattern 1: Tiered Rate Limiting (By User Role)

```javascript
// middlewares/rateLimiter.js

const rateLimit = require("express-rate-limit");

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limits for different roles
const limiters = {
  guest: createLimiter(
    15 * 60 * 1000, // 15 minutes
    50, // 50 requests
    "Vui lòng đăng nhập để tăng giới hạn truy cập"
  ),

  user: createLimiter(
    15 * 60 * 1000, // 15 minutes
    200, // 200 requests
    "Quá nhiều yêu cầu, vui lòng thử lại sau"
  ),

  manager: createLimiter(
    15 * 60 * 1000, // 15 minutes
    500, // 500 requests
    "Quá nhiều yêu cầu, vui lòng thử lại sau"
  ),

  admin: createLimiter(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requests
    "Quá nhiều yêu cầu, vui lòng thử lại sau"
  ),
};

// Middleware to apply appropriate limiter
const adaptiveRateLimiter = (req, res, next) => {
  const userRole = req.user?.PhanQuyen || "guest";
  const limiter = limiters[userRole] || limiters.guest;
  limiter(req, res, next);
};

module.exports = { adaptiveRateLimiter, limiters };
```

**Usage:**

```javascript
// app.js
const { adaptiveRateLimiter } = require("./middlewares/rateLimiter");

app.use("/api/", adaptiveRateLimiter);
```

### Pattern 2: Endpoint-Specific Limits

```javascript
// config/rateLimits.js

module.exports = {
  // Authentication endpoints (strict)
  auth: {
    login: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 attempts
      skipSuccessfulRequests: true,
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 registrations
    },
    forgotPassword: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts
    },
  },

  // Public endpoints (moderate)
  public: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests
  },

  // File uploads (strict)
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads
  },

  // Reports/exports (strict, CPU intensive)
  export: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 exports
  },

  // Search (moderate)
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 searches
  },
};

// Apply in routes:
const rateLimit = require("express-rate-limit");
const limits = require("../config/rateLimits");

const loginLimiter = rateLimit({
  ...limits.auth.login,
  message: "Quá nhiều lần đăng nhập thất bại",
});

router.post("/login", loginLimiter, authController.login);
```

### Pattern 3: Dynamic Limits Based on Server Load

```javascript
const rateLimit = require("express-rate-limit");
const os = require("os");

const createAdaptiveLimiter = () => {
  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute

    max: (req, res) => {
      // Adjust max based on server load
      const loadAvg = os.loadavg()[0]; // 1-minute load average
      const cpuCount = os.cpus().length;
      const loadPercentage = (loadAvg / cpuCount) * 100;

      if (loadPercentage > 80) {
        return 10; // High load: strict limit
      } else if (loadPercentage > 50) {
        return 50; // Medium load: moderate limit
      } else {
        return 100; // Low load: lenient limit
      }
    },

    message: (req, res) => ({
      success: false,
      message: "Server đang tải cao, vui lòng thử lại sau",
      serverLoad: os.loadavg()[0].toFixed(2),
    }),

    standardHeaders: true,
  });
};

module.exports = createAdaptiveLimiter;
```

---

## 🗄️ Store Options (Production)

### Default: MemoryStore (Single Server)

```javascript
// ⚠️ WARNING: MemoryStore không share giữa multiple processes/servers
// Chỉ dùng cho development hoặc single-server deployment

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // store: default MemoryStore
});
```

**Limitations:**

- Không persistent (restart → reset counters)
- Không share giữa PM2 cluster workers
- Không share giữa load-balanced servers

### Redis Store (Recommended for Production)

```bash
npm install rate-limit-redis redis
```

```javascript
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("redis");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:", // Key prefix trong Redis
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
```

**Benefits:**

- ✅ Persistent across restarts
- ✅ Shared across cluster workers
- ✅ Shared across load-balanced servers
- ✅ Fast (in-memory)

### Memcached Store

```bash
npm install rate-limit-memcached memjs
```

```javascript
const rateLimit = require("express-rate-limit");
const MemcachedStore = require("rate-limit-memcached");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new MemcachedStore({
    client: "localhost:11211",
    prefix: "rl:",
  }),
});
```

---

## 🔧 Advanced Use Cases

### Case 1: Combine with Authentication

```javascript
const rateLimit = require("express-rate-limit");

const createAuthenticatedLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    // Use user ID as key nếu logged in, fallback to IP
    keyGenerator: (req, res) => {
      if (req.user && req.user._id) {
        return `user:${req.user._id}`;
      }
      return `ip:${req.ip}`;
    },

    // Skip rate limiting for admins
    skip: (req, res) => {
      return req.user && req.user.PhanQuyen === "admin";
    },

    message: {
      success: false,
      message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
    },
  });
};

// Usage:
app.use("/api/", authenticate, createAuthenticatedLimiter());
```

### Case 2: Different Limits for Different HTTP Methods

```javascript
const methodBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: (req, res) => {
    switch (req.method) {
      case "GET":
        return 200; // More lenient for reads
      case "POST":
      case "PUT":
      case "PATCH":
        return 50; // Stricter for writes
      case "DELETE":
        return 10; // Very strict for deletes
      default:
        return 100;
    }
  },

  message: (req, res) => ({
    success: false,
    message: `Quá nhiều ${req.method} requests, vui lòng thử lại sau`,
  }),
});
```

### Case 3: Whitelist/Blacklist IPs

```javascript
const whitelistedIPs = ["192.168.1.100", "10.0.0.1"];
const blacklistedIPs = ["203.0.113.1", "198.51.100.1"];

const ipFilteredLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  skip: (req, res) => {
    // Blacklist check
    if (blacklistedIPs.includes(req.ip)) {
      res.status(403).json({
        success: false,
        message: "IP bị chặn",
      });
      return true; // Skip rate limiter (already blocked)
    }

    // Whitelist check
    if (whitelistedIPs.includes(req.ip)) {
      return true; // Skip rate limiter
    }

    return false; // Apply rate limiter
  },
});
```

### Case 4: Gradual Response Degradation

```javascript
const degradationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,

  handler: (req, res, next, options) => {
    const remaining = res.getHeader("RateLimit-Remaining");
    const limit = res.getHeader("RateLimit-Limit");
    const used = limit - remaining;
    const percentage = (used / limit) * 100;

    if (percentage >= 100) {
      // Completely blocked
      return res.status(429).json({
        success: false,
        message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
        retryAfter: res.getHeader("Retry-After"),
      });
    } else if (percentage >= 80) {
      // Add artificial delay (slow down)
      setTimeout(() => next(), 2000);
    } else if (percentage >= 50) {
      setTimeout(() => next(), 500);
    } else {
      next();
    }
  },
});
```

---

## 📊 Monitoring & Logging

### Log Rate Limit Events

```javascript
const rateLimit = require("express-rate-limit");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "rate-limit.log" })],
});

const monitoredLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  onLimitReached: (req, res, options) => {
    logger.warn({
      event: "rate_limit_reached",
      ip: req.ip,
      path: req.path,
      method: req.method,
      user: req.user?._id || "guest",
      timestamp: new Date().toISOString(),
    });
  },

  handler: (req, res, next, options) => {
    logger.error({
      event: "rate_limit_exceeded",
      ip: req.ip,
      path: req.path,
      method: req.method,
      user: req.user?._id || "guest",
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: options.message,
    });
  },
});
```

### Prometheus Metrics

```javascript
const client = require("prom-client");

const rateLimitCounter = new client.Counter({
  name: "rate_limit_exceeded_total",
  help: "Total number of rate limit exceeded events",
  labelNames: ["path", "method", "ip"],
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  handler: (req, res, next, options) => {
    rateLimitCounter.inc({
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(429).json(options.message);
  },
});
```

---

## 🐛 Troubleshooting

### Issue 1: Rate Limit không hoạt động với Proxy/Load Balancer

**Symptoms**: Tất cả requests có cùng IP (`127.0.0.1` hoặc proxy IP)

**Solution**: Enable trust proxy

```javascript
// app.js
app.set("trust proxy", 1); // Trust first proxy

// Or more specific:
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
```

### Issue 2: Rate Limit reset sau mỗi restart

**Symptoms**: Counters về 0 sau restart server

**Solution**: Dùng external store (Redis, Memcached)

```javascript
// Use Redis store instead of MemoryStore
const RedisStore = require("rate-limit-redis");
const redis = require("redis");

const redisClient = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  // ...
});
```

### Issue 3: PM2 Cluster không share rate limit

**Symptoms**: Mỗi worker có counter riêng

**Solution**: Dùng external store

```javascript
// Redis store shares state across all workers
const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
});
```

### Issue 4: Headers không xuất hiện

**Symptoms**: Không thấy `RateLimit-*` headers trong response

**Solution**: Enable standardHeaders

```javascript
const limiter = rateLimit({
  standardHeaders: true, // Enable RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});
```

---

## 🎯 Best Practices

### 1. Tiered Limits

- **Guest/Public**: Strict limits (50/15min)
- **Authenticated Users**: Moderate (200/15min)
- **Premium Users**: Lenient (500/15min)
- **Admins**: Very lenient hoặc no limit (1000/15min)

### 2. Endpoint Categories

- **Auth (login, register)**: Very strict (5/hour)
- **Public APIs**: Moderate (30/minute)
- **Protected APIs**: Standard (100/15min)
- **File uploads**: Strict (10/hour)
- **Heavy operations (exports, reports)**: Very strict (5/15min)

### 3. Production Setup

- ✅ Use external store (Redis preferred)
- ✅ Set `trust proxy` nếu behind proxy
- ✅ Log rate limit events
- ✅ Monitor metrics (Prometheus, Grafana)
- ✅ Set up alerts cho abuse patterns
- ✅ Implement IP blacklist/whitelist
- ✅ Use standardHeaders (modern)
- ✅ Custom error messages (Vietnamese)

### 4. Security Considerations

```javascript
// GOOD: Multiple layers
app.use(helmet()); // Security headers
app.use(globalRateLimiter); // Broad protection
app.post("/api/auth/login", strictLoginLimiter, authController.login);

// GOOD: Skip successful requests for auth
const loginLimiter = rateLimit({
  max: 5,
  skipSuccessfulRequests: true, // Only count failed logins
});

// GOOD: Different keys for different contexts
keyGenerator: (req) => {
  if (req.user) return `user:${req.user._id}`;
  return `ip:${req.ip}`;
};
```

---

## 📚 Example Implementation

### Complete Setup cho Hospital Management System

**File**: `giaobanbv-be/middlewares/rateLimiter.js`

```javascript
const rateLimit = require("express-rate-limit");

// Helper to create limiter
const createLimiter = (windowMs, max, message, options = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// Global limiter
const globalLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  "Quá nhiều yêu cầu, vui lòng thử lại sau"
);

// Auth limiters
const loginLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 1 giờ",
  { skipSuccessfulRequests: true }
);

const registerLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  "Quá nhiều lần đăng ký, vui lòng thử lại sau"
);

// Upload limiter
const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  "Quá nhiều file uploads, vui lòng thử lại sau"
);

// Report/Export limiter
const exportLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  "Quá nhiều yêu cầu xuất báo cáo, vui lòng thử lại sau"
);

// Adaptive limiter based on user role
const adaptiveLimiter = (req, res, next) => {
  const limits = {
    guest: 50,
    user: 200,
    manager: 500,
    admin: 1000,
  };

  const userRole = req.user?.PhanQuyen || "guest";
  const maxRequests = limits[userRole] || limits.guest;

  const limiter = createLimiter(
    15 * 60 * 1000,
    maxRequests,
    "Quá nhiều yêu cầu, vui lòng thử lại sau"
  );

  limiter(req, res, next);
};

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
  exportLimiter,
  adaptiveLimiter,
};
```

**Usage trong routes:**

```javascript
// routes/auth.js
const { loginLimiter, registerLimiter } = require("../middlewares/rateLimiter");

router.post("/login", loginLimiter, authController.login);
router.post("/register", registerLimiter, authController.register);

// routes/reports.js
const { exportLimiter } = require("../middlewares/rateLimiter");

router.post("/export", authenticate, exportLimiter, reportController.export);

// app.js
const { globalLimiter } = require("./middlewares/rateLimiter");

app.set("trust proxy", 1);
app.use("/api/", globalLimiter);
```

---

**Hoàn thành!** 🎉 Express Rate Limit đã được tích hợp và configured đầy đủ cho production.
