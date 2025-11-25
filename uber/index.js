import express from "express";
import { run } from "./producer.js";
const app = express();

app.use(express.json());

// app.use(run())

app.get("/rider", (req, res) => {
// locations will come from client side 
  const coords = {
    lat: "sonal",
    long: "kishan",
  };
  run(coords);
  return res.json(coords);
});

app.post("/driver", (req, res) => {
    setInterval(() => {
        
    }, 1000);
  // Sends driver location to Kafka every few seconds
  // Simulates multiple drivers moving
});

app.listen(3000, () => {
  console.log("server is running....");
});
