const mongoose = require('mongoose')
const mongoURL = "mongodb+srv://labibahammed087:labibahammed@storenote.tjtqz3z.mongodb.net/"
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = connectToMongo;
