const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.locationHistory.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.busStop.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.busLine.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@email.com",
      password: bcrypt.hashSync("123456", 10),
      role: "admin"
    }
  });

  const user = await prisma.user.create({
    data: {
      name: "Usuário",
      email: "user@email.com",
      password: bcrypt.hashSync("123456", 10),
      role: "user"
    }
  });

  const line070 = await prisma.busLine.create({
    data: {
      code: "070",
      name: "General Osório",
      description: "Linha que passa pela região do General Osório"
    }
  });

  const line087 = await prisma.busLine.create({
    data: {
      code: "087",
      name: "Júlio de Castilho",
      description: "Linha que passa pela Avenida Júlio de Castilho"
    }
  });

  const driver1 = await prisma.driver.create({
    data: {
      name: "Carlos Almeida",
      phone: "(67) 99999-0001",
      license: "CNH-123456",
      status: "Ativo"
    }
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Marcos Silva",
      phone: "(67) 99999-0002",
      license: "CNH-654321",
      status: "Ativo"
    }
  });

  await prisma.bus.create({
    data: {
      lineId: line070.id,
      driverId: driver1.id,
      lineName: "070 - General Osório",
      plate: "ABC-1234",
      lat: -20.4697,
      lng: -54.6201,
      occupancy: "Normal",
      nextStop: "Terminal General Osório",
      operationalStatus: "Em operação"
    }
  });

  await prisma.bus.create({
    data: {
      lineId: line087.id,
      driverId: driver2.id,
      lineName: "087 - Júlio de Castilho",
      plate: "DEF-5678",
      lat: -20.4632,
      lng: -54.6165,
      occupancy: "Cheio",
      nextStop: "Avenida Afonso Pena",
      operationalStatus: "Em operação"
    }
  });

  await prisma.busStop.createMany({
    data: [
      {
        name: "Terminal General Osório",
        lat: -20.4629,
        lng: -54.6214,
        lineId: line070.id
      },
      {
        name: "Avenida Afonso Pena",
        lat: -20.4654,
        lng: -54.6162,
        lineId: line087.id
      },
      {
        name: "Praça Ary Coelho",
        lat: -20.4688,
        lng: -54.6226
      }
    ]
  });

  console.log("Seed executado com sucesso!");
  console.log("Admin:", admin.email);
  console.log("User:", user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });