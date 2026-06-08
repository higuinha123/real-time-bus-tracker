const express = require("express");
const prisma = require("../prismaClient");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

const DEFAULT_FARE = 4.80;

function generateCardNumber(userId) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BT-${userId}-${random}`;
}

function formatCard(card) {
  return {
    id: card.id,
    cardNumber: card.cardNumber,
    type: card.type,
    balance: card.balance,
    status: card.status,
    createdAt: card.createdAt,
    transactions: card.transactions || []
  };
}

router.get("/my-card", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    let card = await prisma.transportCard.findFirst({
      where: {
        userId
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        }
      }
    });

    if (!card) {
      card = await prisma.transportCard.create({
        data: {
          userId,
          cardNumber: generateCardNumber(userId),
          type: "COMMON",
          balance: 0,
          status: "ACTIVE"
        },
        include: {
          transactions: true
        }
      });
    }

    return res.json(formatCard(card));
  } catch (error) {
    console.error("Erro ao buscar cartão:", error);

    return res.status(500).json({
      message: "Erro ao buscar cartão digital."
    });
  }
});

router.post("/recharge", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const rechargeAmount = Number(amount);

    if (!rechargeAmount || rechargeAmount <= 0) {
      return res.status(400).json({
        message: "Informe um valor válido para recarga."
      });
    }

    if (rechargeAmount > 500) {
      return res.status(400).json({
        message: "O valor máximo para recarga simulada é R$ 500,00."
      });
    }

    let card = await prisma.transportCard.findFirst({
      where: {
        userId
      }
    });

    if (!card) {
      card = await prisma.transportCard.create({
        data: {
          userId,
          cardNumber: generateCardNumber(userId),
          type: "COMMON",
          balance: 0,
          status: "ACTIVE"
        }
      });
    }

    const updatedCard = await prisma.transportCard.update({
      where: {
        id: card.id
      },
      data: {
        balance: card.balance + rechargeAmount
      }
    });

    await prisma.transaction.create({
      data: {
        cardId: card.id,
        type: "RECHARGE",
        amount: rechargeAmount,
        description: `Recarga simulada de R$ ${rechargeAmount.toFixed(2)}`
      }
    });

    const cardWithTransactions = await prisma.transportCard.findUnique({
      where: {
        id: updatedCard.id
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        }
      }
    });

    return res.json({
      message: "Recarga realizada com sucesso.",
      card: formatCard(cardWithTransactions)
    });
  } catch (error) {
    console.error("Erro ao recarregar cartão:", error);

    return res.status(500).json({
      message: "Erro ao realizar recarga."
    });
  }
});

router.post("/pay-fare", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { busId } = req.body;

    const card = await prisma.transportCard.findFirst({
      where: {
        userId
      }
    });

    if (!card) {
      return res.status(404).json({
        message: "Cartão digital não encontrado."
      });
    }

    if (card.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cartão bloqueado ou inativo."
      });
    }

    let fare = DEFAULT_FARE;
    let description = "Pagamento de passagem comum";

    if (card.type === "STUDENT") {
      fare = DEFAULT_FARE / 2;
      description = "Pagamento de passagem estudantil";
    }

    if (card.type === "ELDERLY") {
      fare = 0;
      description = "Embarque gratuito - cartão idoso";
    }

    if (card.balance < fare) {
      return res.status(400).json({
        message: "Saldo insuficiente."
      });
    }

    let busInfo = "";

    if (busId) {
      const bus = await prisma.bus.findUnique({
        where: {
          id: Number(busId)
        }
      });

      if (bus) {
        busInfo = ` no ônibus ${bus.plate}`;
      }
    }

    const updatedCard = await prisma.transportCard.update({
      where: {
        id: card.id
      },
      data: {
        balance: card.balance - fare
      }
    });

    await prisma.transaction.create({
      data: {
        cardId: card.id,
        type: "FARE_PAYMENT",
        amount: fare,
        description: `${description}${busInfo}`
      }
    });

    const cardWithTransactions = await prisma.transportCard.findUnique({
      where: {
        id: updatedCard.id
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        }
      }
    });

    return res.json({
      message: "Embarque liberado.",
      fare,
      card: formatCard(cardWithTransactions)
    });
  } catch (error) {
    console.error("Erro ao pagar passagem:", error);

    return res.status(500).json({
      message: "Erro ao processar pagamento da passagem."
    });
  }
});

module.exports = router;