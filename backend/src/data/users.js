const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    name: "Admin",
    email: "admin@email.com",
    password: bcrypt.hashSync("123456", 10),
    role: "admin"
  },
  {
    id: 2,
    name: "Usuário",
    email: "user@email.com",
    password: bcrypt.hashSync("123456", 10),
    role: "user"
  }
];

module.exports = users;