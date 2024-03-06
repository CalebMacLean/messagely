/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;

const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://${username}:${password}@localhost/messagely_test`
  : `postgresql://${username}:${password}@localhost/messagely`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};