import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Reservation } from '../models/Reservations'
import { Op } from 'sequelize'

@Controller('reservations')
export class ReservationsController {
  @Get('')
  private async getReservationsByDate(req: Request, res: Response) {
    try {
      const reservationDate = req.query.date;
      const reservations = await Reservation.findAll({
        where: {
          date: {
            [Op.like]: reservationDate + '%'
          }
        },
        order: [
          ['date', 'ASC']
        ],
      });
      if (reservations) {
        return res.status(200).json(reservations);
      }
      return res.status(404).send('No reservations exist for this date');
    } catch (error) {
      console.log(error.message)
      return res.status(500).send(error.message);
    }
  }

  @Post()
  private async createReservation(req: Request, res: Response) {
    try {
      const reservation = Reservation.create(req.body)
      return res.status(200).send(reservation)
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ error: error.message })
    }
  }
}
