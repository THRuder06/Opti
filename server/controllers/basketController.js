// const {Basket, BasketDevice, Device} = require('../models/models');
// const ApiError = require('../error/ApiError');

// class BasketController {
//     // Добавление товара в корзину
//     async addDevice(req, res, next) {
//         try {
//             const {deviceId, basketId} = req.body;
//             const basketDevice = await BasketDevice.create({basketId, deviceId});
//             return res.json(basketDevice);
//         } catch (error) {
//             next(ApiError.internal('Ошибка при добавлении товара в корзину'));
//         }
//     }

//     // Получение всех товаров в корзине
//     async getAll(req, res, next) {
//         try {
//             const {basketId} = req.params;
//             const basketDevices = await BasketDevice.findAll({
//                 where: {basketId},
//                 include: [{model: Device, as: 'device'}]
//             });
//             return res.json(basketDevices);
//         } catch (error) {
//             next(ApiError.internal('Ошибка при получении товаров из корзины'));
//         }
//     }

//     // Проверка наличия товара в корзине
//     async checkDevice(req, res, next) {
//         try {
//             const {basketId, deviceId} = req.params;
//             const basketDevice = await BasketDevice.findOne({
//                 where: {basketId, deviceId}
//             });
//             if (basketDevice) {
//                 return res.json({exists: true});
//             }
//             return res.json({exists: false});
//         } catch (error) {
//             next(ApiError.internal('Ошибка при проверке товара в корзине'));
//         }
//     }

//     // Удаление товара из корзины
//     async removeDevice(req, res, next) {
//         try {
//             const {basketId, deviceId} = req.params;
//             const result = await BasketDevice.destroy({
//                 where: {basketId, deviceId}
//             });
//             if (result) {
//                 return res.json({message: 'Товар удален из корзины'});
//             }
//             return next(ApiError.badRequest('Товар не найден в корзине'));
//         } catch (error) {
//             next(ApiError.internal('Ошибка при удалении товара из корзины'));
//         }
//     }
// }

// module.exports = new BasketController();

const { Basket, BasketDevice, Device } = require('../models/models');
const ApiError = require('../error/ApiError');

class BasketController {
    // Получение ID корзины пользователя из параметра userId
    async getAll(req, res, next) {
        try {
          const { userId } = req.params;
          
          // Получаем корзину пользователя
          const basket = await Basket.findOne({ where: { userId } });
          if (!basket) {
            return res.json([]);
          }
      
          const basketDevices = await BasketDevice.findAll({
            where: { basketId: basket.id },
            include: [{ model: Device, as: 'device' }]
          });
      
          return res.json(basketDevices);
        } catch (error) {
          next(ApiError.internal('Ошибка при получении товаров из корзины'));
        }
      }
      

      async addDevice(req, res, next) {
        try {
          const { userId, deviceId } = req.body;
          
          // Находим корзину пользователя
          const basket = await Basket.findOne({ where: { userId } });
          if (!basket) {
            return next(ApiError.badRequest('Корзина не найдена'));
          }
      
          // Проверяем, есть ли уже товар в корзине
          let basketDevice = await BasketDevice.findOne({
            where: { basketId: basket.id, deviceId }
          });
      
          if (basketDevice) {
            // Если товар уже есть, увеличиваем количество
            basketDevice.quantity += 1;
            await basketDevice.save();
          } else {
            // Если товара нет, добавляем его с количеством 1
            basketDevice = await BasketDevice.create({ basketId: basket.id, deviceId, quantity: 1 });
          }
          
          return res.json(basketDevice);
        } catch (error) {
          next(ApiError.internal('Ошибка при добавлении товара в корзину'));
        }
      }

      async updateQuantity(req, res, next) {
        try {
          const { userId, deviceId, quantity } = req.body;
      
          const basket = await Basket.findOne({ where: { userId } });
          if (!basket) {
            return next(ApiError.badRequest('Корзина не найдена'));
          }
      
          const basketDevice = await BasketDevice.findOne({
            where: { basketId: basket.id, deviceId }
          });
      
          if (basketDevice) {
            basketDevice.quantity = quantity;
            await basketDevice.save();
            return res.json(basketDevice);
          } else {
            return next(ApiError.badRequest('Товар не найден в корзине'));
          }
        } catch (error) {
          next(ApiError.internal('Ошибка при изменении количества товара в корзине'));
        }
      }
      

    // Проверка наличия товара в корзине
    async checkDevice(req, res, next) {
        try {
          const { userId, deviceId } = req.params;
          
          // Находим корзину пользователя
          const basket = await Basket.findOne({ where: { userId } });
          if (!basket) {
            return res.json({ exists: false });
          }
      
          // Проверяем наличие товара в корзине
          const basketDevice = await BasketDevice.findOne({
            where: { basketId: basket.id, deviceId }
          });
          if (basketDevice) {
            return res.json({ exists: true });
          }
          return res.json({ exists: false });
        } catch (error) {
          next(ApiError.internal('Ошибка при проверке товара в корзине'));
        }
      }
      

    // Удаление товара из корзины
    async removeDevice(req, res, next) {
        try {
          const { deviceId } = req.params;
          const { userId } = req.query; // Получаем userId из query параметров
      
          const basket = await Basket.findOne({ where: { userId } });
      
          if (!basket) return next(ApiError.badRequest('Корзина не найдена'));
      
          const result = await BasketDevice.destroy({
            where: { basketId: basket.id, deviceId }
          });
      
          if (result) {
            return res.json({ message: 'Товар удален из корзины' });
          }
      
          return next(ApiError.badRequest('Товар не найден в корзине'));
        } catch (error) {
          next(ApiError.internal('Ошибка при удалении товара из корзины'));
        }
      }
}

module.exports = new BasketController();

