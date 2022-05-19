const mongoose = require('mongoose');
require('dotenv').config({path: '../../.env'});
const fs = require('fs');
const Tour = require('../../model/tourModel');

console.log(process.env.DATABASE);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection sucessfully');
  });

const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data sucessfully loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Deleted'); 
    } catch (err) {
        console.log(err);
    }
}

importData();

