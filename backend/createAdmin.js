const bcrypt = require("bcryptjs");
const prisma = require("./src/prismaClient");

async function createAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: "admin@email.com"
      }
    });

    if (admin) {
      console.log("Admin já existe.");
      return;
    }

    const hashedPassword = bcrypt.hashSync("123456", 10);

    await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@email.com",
        password: hashedPassword,
        role: "admin"
      }
    });

    console.log("Admin criado com sucesso!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();