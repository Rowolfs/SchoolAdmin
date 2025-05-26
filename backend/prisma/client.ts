
const { PrismaClient } = require('@prisma/client');



 class PrismaSingleton {

  private static instance: PrismaClient;

  // приватный конструктор, чтобы класс нельзя было инстанцировать извне
  private constructor() {}

  // обычный static-метод, возвращающий экземпляр
  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient();
    }
    return PrismaSingleton.instance;
  }
}


module.exports = PrismaSingleton;