const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");


main().then(()=>{
    console.log("Connected to the mongodb");
})
.catch((err)=>{
    console.log(err);    
})
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/urbanEscape");
}

const initDB = async ()=>{
   await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({ ...obj , owner: "67fb3a8e1442b737a3aa44b2"}));
    await Listing.insertMany(initdata.data);
    console.log("Data was initialized!!");
}

initDB();