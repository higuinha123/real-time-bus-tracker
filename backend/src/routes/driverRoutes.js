const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const {
  validateName,
  validatePhone,
  validateLicense,
  validateStatus
} = require("../utils/validators");

const router = express.Router();

const VALID_DRIVER_STATUSES = ["Ativo", "Afastado", "Inativo"];

function validateDriver(data) {
  const nameError = validateName(data.name, "Nome do motorista");
  if (nameError) return nameError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) return phoneError;

  const licenseError = validateLicense(data.license);
  if (licenseError) return licenseError;

  const statusError = validateStatus(
    data.status,
    VALID_DRIVER_STATUSES,
    "Status do motorista"
  );
  if (statusError) return statusError;

  return null;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { id: "asc" }
    });

    return res.json(drivers);
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);

    return res.status(500).json({
      message: "Erro ao buscar motoristas."
    });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, phone, license, status = "Ativo" } = req.body;

    const validationError = validateDriver({
      name,
      phone,
      license,
      status
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingDriver = await prisma.driver.findFirst({
      where: {
        license: license.trim()
      }
    });

    if (existingDriver) {
      return res.status(400).json({
        message: "Já existe um motorista cadastrado com essa CNH."
      });
    }

    const driver = await prisma.driver.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        license: license.trim(),
        status
      }
    });

    return res.status(201).json(driver);
  } catch (error) {
    console.error("Erro ao criar motorista:", error);

    return res.status(500).json({
      message: "Erro ao criar motorista."
    });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID do motorista inválido."
      });
    }

    const { name, phone, license, status } = req.body;

    const validationError = validateDriver({
      name,
      phone,
      license,
      status
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const driverExists = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driverExists) {
      return res.status(404).json({
        message: "Motorista não encontrado."
      });
    }

    const existingDriverWithSameLicense = await prisma.driver.findFirst({
      where: {
        license: license.trim(),
        NOT: {
          id
        }
      }
    });

    if (existingDriverWithSameLicense) {
      return res.status(400).json({
        message: "Já existe outro motorista cadastrado com essa CNH."
      });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        license: license.trim(),
        status
      }
    });

    return res.json(updatedDriver);
  } catch (error) {
    console.error("Erro ao atualizar motorista:", error);

    return res.status(500).json({
      message: "Erro ao atualizar motorista."
    });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID do motorista inválido."
      });
    }

    const driverExists = await prisma.driver.findUnique({
      where: { id },
      include: {
        buses: true
      }
    });

    if (!driverExists) {
      return res.status(404).json({
        message: "Motorista não encontrado."
      });
    }

    if (driverExists.buses.length > 0) {
      return res.status(400).json({
        message:
          "Não é possível excluir este motorista porque ele está vinculado a um ônibus."
      });
    }

    await prisma.driver.delete({
      where: { id }
    });

    return res.json({
      message: "Motorista removido com sucesso."
    });
  } catch (error) {
    console.error("Erro ao excluir motorista:", error);

    return res.status(500).json({
      message: "Erro ao excluir motorista."
    });
  }
});

module.exports = router;