const mongoose = require("mongoose");
const Course = require("./models/course");
const Subscriber = require("./models/subscriber");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/recipe_db");

  const testCourse = await Course.create({
    title: "Test Course",
    description: "This is a test course.",
    items: ["cherry", "heirloom"]
  });

  const testSubscriber = await Subscriber.findOne({});

  testSubscriber.courses.push(testCourse);
  await testSubscriber.save();

  console.log("Saved:", testSubscriber);
})();

let courses = [
    {
        title: "Event Driven Cakes",
        cost: 50
    },
    {
        title: "Asynchronous Artichoke",
        cost: 25
    },
    {
        title: "Object Oriented Orange Juice",
        cost: 10
    }
]

const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/recipe_db")

const User = require("./models/user")

User.create({
    name: {
        first: "Sumireko",
        last: "Usami"
    },
    email: "hihu@club.com",
    membershipNumber: 10000,
    password: "pass1290"
})
    .then(user => testUser = user)
    .catch(error => console.log(error.message))

(async () => {
  try {
    const testUser = await User.create({
      name: {
        first: "Sumireko",
        last: "Usami"
      },
      email: "hihu@club.com",
      membershipNumber: 10000,
      password: "pass1290"
    });

    const subscriber = await Subscriber.findOne({
      name: testUser.fullName
    });

    testUser.subscribedAccount = subscriber;
    await testUser.save();
    console.log("Updated user:", testUser._id.toString());

    console.log("user updated");
  } catch (error) {
    console.log(error.message);
  }
})();