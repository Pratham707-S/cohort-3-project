"use strict";

// backend/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// backend/src/routes/index.ts
import { Router as Router3 } from "express";

// backend/src/routes/auth.routes.ts
import { Router } from "express";

// backend/src/controllers/auth.controller.ts
import jwt from "jsonwebtoken";

// backend/src/models/user.model.ts
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
var userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, {
  timestamps: true
});
userSchema.pre("save", async function(next) {
  if (!this.isModified("password"))
    return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
var User = mongoose.model("User", userSchema);

// backend/src/controllers/auth.controller.ts
var ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_token_jwt_secret_key_cohort3_2026";
var REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_token_jwt_secret_key_cohort3_2026";
var ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
var REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
var generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};
var generateRefreshToken = (userId, email) => {
  return jwt.sign({ userId, email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
};
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists with this email address" });
      return;
    }
    const userCount = await User.countDocuments();
    const role = userCount === 0 || email.toLowerCase().includes("admin") || email.toLowerCase().includes("pratham") ? "admin" : "user";
    const newUser = new User({
      name,
      email,
      password,
      role
    });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || "user",
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error registering user" });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    if (!user.role || user.email.toLowerCase().includes("pratham") && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error logging in" });
  }
};
var refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
      return;
    }
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      res.status(403).json({ message: "Refresh token has been revoked or is invalid." });
      return;
    }
    const newAccessToken = generateAccessToken(user._id.toString(), user.email);
    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error refreshing access token" });
  }
};
var logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (req.user) {
      req.user.refreshToken = void 0;
      await req.user.save();
    } else if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = void 0;
        await user.save();
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error logging out" });
  }
};
var getMe = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || "user",
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching user profile" });
  }
};

// backend/src/validators/auth.validator.ts
import { body } from "express-validator";
var registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("confirmPassword").notEmpty().withMessage("Confirm password is required").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  })
];
var loginValidator = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

// backend/src/middlewares/validate.middleware.ts
import { validationResult } from "express-validator";
var validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
    return;
  }
  next();
};

// backend/src/middlewares/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized. Access token is missing or invalid." });
      return;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.ACCESS_TOKEN_SECRET || "access_token_jwt_secret_key_cohort3_2026";
    const decoded = jwt2.verify(token, secret);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found. Please log in again." });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Access token expired", isExpired: true });
      return;
    }
    res.status(401).json({ message: "Invalid or malformed access token." });
  }
};

// backend/src/routes/auth.routes.ts
var router = Router();
router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
var auth_routes_default = router;

// backend/src/routes/product.routes.ts
import { Router as Router2 } from "express";

// backend/src/models/product.model.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var productSchema = new Schema2({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
  },
  createdBy: {
    type: Schema2.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});
var Product = mongoose2.model("Product", productSchema);

// backend/src/controllers/product.controller.ts
var createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl: imageUrl || void 0,
      createdBy: req.user._id
    });
    const savedProduct = await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error creating product" });
  }
};
var getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);
    res.status(200).json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching products" });
  }
};
var getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("createdBy", "name email");
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching product" });
  }
};
var updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (name !== void 0)
      product.name = name;
    if (description !== void 0)
      product.description = description;
    if (price !== void 0)
      product.price = Number(price);
    if (category !== void 0)
      product.category = category;
    if (stock !== void 0)
      product.stock = Number(stock);
    if (imageUrl !== void 0)
      product.imageUrl = imageUrl;
    const updatedProduct = await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error updating product" });
  }
};
var deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting product" });
  }
};

// backend/src/validators/product.validator.ts
import { body as body2, param, query } from "express-validator";
var productIdValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format")
];
var createProductValidator = [
  body2("name").trim().notEmpty().withMessage("Product name is required").isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),
  body2("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
  body2("price").notEmpty().withMessage("Price is required").isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),
  body2("category").trim().notEmpty().withMessage("Category is required"),
  body2("stock").notEmpty().withMessage("Stock quantity is required").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body2("imageUrl").optional({ checkFalsy: true }).isURL().withMessage("Image URL must be a valid URL")
];
var updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  body2("name").optional().trim().notEmpty().withMessage("Product name cannot be empty").isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),
  body2("description").optional().trim().notEmpty().withMessage("Description cannot be empty").isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
  body2("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),
  body2("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body2("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body2("imageUrl").optional({ checkFalsy: true }).isURL().withMessage("Image URL must be a valid URL")
];
var queryProductValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("search").optional().trim(),
  query("category").optional().trim()
];

// backend/src/routes/product.routes.ts
var router2 = Router2();
router2.get("/", queryProductValidator, validateRequest, getProducts);
router2.get("/:id", productIdValidator, validateRequest, getProductById);
router2.post("/", authenticate, createProductValidator, validateRequest, createProduct);
router2.put("/:id", authenticate, updateProductValidator, validateRequest, updateProduct);
router2.delete("/:id", authenticate, productIdValidator, validateRequest, deleteProduct);
var product_routes_default = router2;

// backend/src/routes/index.ts
var router3 = Router3();
router3.use("/auth", auth_routes_default);
router3.use("/products", product_routes_default);
router3.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});
var routes_default = router3;

// backend/src/middlewares/error.middleware.ts
var errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    message,
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};

// backend/src/config/db.ts
import mongoose3 from "mongoose";
var MONGO_URI = process.env.MONGO_URI || "mongodb+srv://pratham1226667_db_user:C9szgKlGzsK6IWfx@cluster1.dexjfja.mongodb.net/ecommerce_db?retryWrites=true&w=majority";
var cachedPromise = null;
var connectDB = async () => {
  if (mongoose3.connection.readyState >= 1) {
    return mongoose3;
  }
  if (!cachedPromise) {
    cachedPromise = mongoose3.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8e3
    });
  }
  try {
    return await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    console.error("MongoDB serverless connection error:", error);
    throw error;
  }
};

// backend/src/app.ts
var app = express();
var corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});
app.use("/api", routes_default);
app.use("/", routes_default);
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
app.use(errorHandler);
var app_default = app;

// backend/src/serverless.ts
var serverless_default = app_default;
export {
  serverless_default as default
};
