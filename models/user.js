/** User class for message.ly */
const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const jwt = require('jsonwebtoken');


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
       RETURNING username, password, first_name, last_name, phone`,
       [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    return await bcrypt.compare(password, result.rows[0].password);
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users
       SET last_login_at = current_timestamp
       WHERE username = $1
       RETURNING username, last_login_at`,
       [username]
    );
    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
       FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`,
       [username]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const result = await db.query(
      `SELECT m.id, u.username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
       FROM messages AS m
       JOIN users AS u ON m.to_username = u.username
       WHERE m.from_username = $1`,
       [username]
    );
    // map over result to return an array of objs
    const messages = result.rows.map(row => ({
      id : row.id,
      to_user : {
        username : row.username,
        first_name : row.first_name,
        last_name : row.last_name,
        phone : row.phone
      },
      body : row.body,
      sent_at : row.sent_at,
      read_at : row.read_at
    }))

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    console.log('username:', username);
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone 
        FROM messages AS m
        JOIN users AS u ON m.from_username = u.username
        WHERE m.to_username = $1`,
      [username]
    );
    // map over result to return an array of objs
    const messages = result.rows.map(r => ({
      id : r.id,
      from_user : {
        username : r.username,
        first_name : r.first_name,
        last_name : r.last_name,
        phone : r.phone
      },
      body : r.body,
      sent_at : r.sent_at,
      read_at : r.read_at
    }));
    console.log('messages:', messages);
    return messages;
  }
}


module.exports = User;