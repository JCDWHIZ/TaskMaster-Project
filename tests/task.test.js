const request = require("supertest");
const app = require("../index"); // Your Express app
const Task = require("../Models/TaskModel"); // Task model
const User = require("../Models/UserModel"); // User model
const jwt = require("jsonwebtoken");
const { connectTestDB, disconnectTestDB } = require("./testUtils");

let mongoServer;
let authToken;
let userId;

beforeAll(async () => {
  connectTestDB();
  const user = await User.create({
    username: "testuser",
    email: "test@example.com",
    passwordHash: "hashedpassword",
  });
  userId = user._id;
  authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  disconnectTestDB();
});

afterEach(async () => {
  await Task.deleteMany();
});

describe("Task API", () => {
  describe("Create Task", () => {
    test("should create a task successfully", async () => {
      const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Task",
          description: "This is a test task",
          deadline: "2024-12-31",
          priority: "High",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Task created successfully.");
      expect(response.body.task).toMatchObject({
        title: "Test Task",
        description: "This is a test task",
        deadline: "2024-12-31T00:00:00.000Z",
        priority: "High",
        userId: userId.toString(),
      });
    });

    test("should fail to create a task without required fields", async () => {
      const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          description: "Missing title and priority",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Title and priority are required.");
    });
  });

  describe("Get Tasks", () => {
    beforeEach(async () => {
      await Task.insertMany([
        {
          title: "Task 1",
          description: "First task",
          deadline: "2024-12-31",
          priority: "High",
          userId,
        },
        {
          title: "Task 2",
          description: "Second task",
          deadline: "2024-11-30",
          priority: "Medium",
          userId,
        },
      ]);
    });

    test("should fetch all tasks for the user", async () => {
      const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.tasks).toHaveLength(2);
    });

    test("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/tasks?priority=High")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].priority).toBe("High");
    });

    test("should filter tasks by due date", async () => {
      const response = await request(app)
        .get("/tasks?dueBefore=2024-12-01")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe("Task 2");
    });

    test("should search tasks by title or description", async () => {
      const response = await request(app)
        .get("/tasks?search=Second")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe("Task 2");
    });
  });

  describe("Update Task", () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Original Task",
        description: "Original description",
        deadline: "2024-12-31",
        priority: "Low",
        userId,
      });
      taskId = task._id;
    });

    test("should update a task successfully", async () => {
      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Task",
          description: "Updated description",
          priority: "High",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Task updated successfully.");
      expect(response.body.task).toMatchObject({
        title: "Updated Task",
        description: "Updated description",
        priority: "High",
      });
    });

    test("should fail to update a non-existent task", async () => {
      const response = await request(app)
        .put(`/tasks/invalidTaskId`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Non-existent Task",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Task not found or unauthorized.");
    });
  });

  describe("Delete Task", () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Task to Delete",
        description: "Task will be deleted",
        deadline: "2024-12-31",
        priority: "Low",
        userId,
      });
      taskId = task._id;
    });

    test("should delete a task successfully", async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully.");

      const task = await Task.findById(taskId);
      expect(task).toBeNull();
    });

    test("should fail to delete a non-existent task", async () => {
      const response = await request(app)
        .delete(`/tasks/invalidTaskId`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Task not found or unauthorized.");
    });
  });
});
