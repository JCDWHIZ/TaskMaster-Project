const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../index"); // Your Express app
const User = require("../Models/UserModel"); // User model
const { connectTestDB, disconnectTestDB } = require("./testUtils");

let mongoServer;

// Set up and tear down the in-memory database
beforeAll(async () => {
  connectTestDB();
});

afterAll(async () => {
  disconnectTestDB();
});

afterEach(async () => {
  await User.deleteMany(); // Clear users after each test
});

describe("Authentication API", () => {
  describe("User Registration", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("User registered successfully.");

      const user = await User.findOne({ email: "test@example.com" });
      expect(user).not.toBeNull();
      expect(await bcrypt.compare("password123", user.passwordHash)).toBe(true);
    });

    test("should fail to register an existing user", async () => {
      await User.create({
        username: "testuser",
        email: "test@example.com",
        passwordHash: await bcrypt.hash("password123", 10),
      });

      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe("User already exists.");
    });

    test("should fail registration with missing fields", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("All fields are required.");
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        username: "testuser",
        email: "test@example.com",
        passwordHash: hashedPassword,
      });
    });

    test("should log in a user with valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Login successful.");
      expect(response.body.token).toBeDefined();

      // Verify JWT token
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBeDefined();
    });

    test("should fail login with invalid email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "wrong@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("User not found.");
    });

    test("should fail login with invalid password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Invalid credentials.");
    });

    test("should fail login with missing fields", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "",
        password: "",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("All fields are required.");
    });
  });
});
