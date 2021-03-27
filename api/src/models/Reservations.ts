import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt
} from 'sequelize-typescript'

@Table({ tableName: 'reservations' })
export class Reservation extends Model<Reservation> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  date: string

  @Column
  emailAddress: string

  @Column
  partyName: string

  @Column
  partySize: number

  @DeletedAt
  deleted_at: Date

  @CreatedAt
  created_at: Date

  @UpdatedAt
  updated_at: Date
}
