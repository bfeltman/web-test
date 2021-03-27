import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt
} from 'sequelize-typescript'

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  date: string

  @Column
  maximumAvailable: number

  @Column
  numberCreated: number

  @DeletedAt
  deleted_at: Date

  @CreatedAt
  created_at: Date

  @UpdatedAt
  updated_at: Date
}
