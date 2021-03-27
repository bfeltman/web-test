import { Controller, Get, Post, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventory } from '../models/Inventory'
import { col, Op } from 'sequelize'

@Controller('inventory')
export class InventoryController {
  @Get('')
  private async getInventoryByDate(req: Request, res: Response) {
    try {
      const inventoryDate = req.query.date;
      const inventory = await Inventory.findAll({
        where: {
          date: {
            [Op.like]: inventoryDate + '%'
          }
        },
        order: [
          ['date', 'ASC']
        ],
      });
      if (inventory) {
        return res.status(200).send(inventory);
      }
      return res.status(404).send('No inventory exists for this date');
    } catch (error) {
      console.log(error.message)
      return res.status(500).send(error.message);
    }
  }

  @Get('available')
  private async getInventoryByAvailablity(req: Request, res: Response) {
    try {
      const inventoryDate = req.query.date;
      const inventory = await Inventory.findAll({
        where: {
          date: {
            [Op.like]: inventoryDate + '%'
          },
          numberCreated: {
            [Op.lt]: col('maximumAvailable')
          }
        },
        order: [
          ['date', 'ASC']
        ],
      });
      if (inventory) {
        return res.status(200).send(inventory);
      }
      return res.status(404).send('No inventory exists for this date');
    } catch (error) {
      console.log(error.message)
      return res.status(500).send(error.message);
    }
  }

  @Post('')
  private async post(req: Request, res: Response) {
    try {
      // TODO: Add logic to prevent inventory from overwriting another
      const inventory = req.body;
      inventory.forEach(inv => {
        Inventory.create(inv)
      })
      return res.status(200).send()
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  @Put('')
  private async put(req: Request, res: Response) {
    // TODO: Would need another route to cancel a reservation
    try {
      const inventoryId = req.query.id
      const inventory = Inventory.increment('numberCreated',
        { where:
          { id: inventoryId }
        }
      );
      return res.status(200).send(inventory)
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ error: error.message })
    }
  }
}
