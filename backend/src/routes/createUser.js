const bcrypt = require("bcryptjs");
const prisma = require("./src/prismaClient");

async function createUser() {
  try {
    const email = "user@email.com";
    const password = "123456";

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = bcrypt.hashSync(password, 10);

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: {
          name: "Usuario Teste",
          password: hashedPassword,
          role: "user"
        }
      });

      console.log("Usuario comum ja existia e foi atualizado com sucesso!");
      console.log("Email: user@email.com");
      console.log("Senha: 123456");
      return;
    }

    await prisma.user.create({
      data: {
        name: "Usuario Teste",
        email,
        password: hashedPassword,
        role: "user"
      }
    });

    console.log("Usuario comum criado com sucesso!");
    console.log("Email: user@email.com");
    console.log("Senha: 123456");
  } catch (error) {
    console.error("Erro ao criar usuario:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();