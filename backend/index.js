// IMPORTANT: Make sure you have a .env file in your backend directory with the following line:
// JWT_SECRET=your_secret_key_here
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fs = require('fs');
const path = require('path');

 
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

 
connectDB();

 
const app = express();

 
app.use(express.json());
app.use(cors({
  origin: "*", // later you can restrict to your frontend URL
  credentials: true
}));

 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

 
const movieRoutes = require("./Routes/MovieRoutes");
const userRoutes = require("./Routes/UserRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const watchlistRoutes = require("./Routes/WatchlistRoutes");

 
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/watchlist", watchlistRoutes);

 
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
 
const PORT = process.env.PORT || 15400;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));