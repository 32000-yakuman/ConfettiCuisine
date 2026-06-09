"use strict";

const mongoose = require("mongoose");
const Subscriber = require("./models/subscriber");

mongoose.connect("mongodb://localhost:27017/recipe_db");

const contacts = [
  {
    name: "Hakurei Reimu",
    email: "hakurei@shrine.com",
    membershipNumber: 10001
  },
  {
    name: "Usami Renko",
    email: "hihu@club.com",
    membershipNumber: 0o001
  },
  {
    name: "Maribel Hearn",
    email: "hihu@club.com",
    membershipNumber: 0o002
  }
];

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    await Subscriber.deleteMany({});
    console.log("Subscriber data cleared");

    const results = await Subscriber.insertMany(contacts);
    console.log("Inserted:", results);
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed");
  }
});