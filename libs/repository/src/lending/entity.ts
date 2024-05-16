import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
} from 'typeorm';
import { ethers } from 'ethers';
import { TimeEntity } from '../../utils/TimeEntity';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { StatusEntity } from '../../utils/StatusEntity';
import { Protocol } from '../protocol/entity';
import { Token } from '../token/entity';

@Entity()
@Index('idx_lending_1', ['protocol', 'address'], { unique: false })
@Index('idx_lending_2', ['protocol', 'pid'], { unique: false })
@Index('idx_lending_3', ['protocol', 'address', 'pid'], { unique: true })
export class Lending extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @ManyToOne(() => Protocol, (protocol) => protocol.lendings, {
    nullable: false,
  })
  protocol: Protocol;

  @ManyToOne(() => Token, (token) => token.lendings, { nullable: false })
  token: Token;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  pid: number;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  liquidity_amount: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  liquidity_value: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  supply_amount: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  supply_value: string;

  @Column({ nullable: true })
  supply_apr: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  borrow_amount: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  borrow_value: string;

  @Column({ nullable: true })
  borrow_apr: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  reserve_amount: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  reserve_value: string;

  @Column({ nullable: true })
  data: string;

  @Column({ nullable: true })
  collateral_factor: string;

  @Column({ nullable: true })
  reserve_factor: string;

  @Column({ nullable: true })
  link: string;

  @BeforeInsert()
  @BeforeUpdate()
  toCheckSum(): void {
    if (!this.address) {
      this.address = ethers.utils.getAddress(this.address);
    }
  }

  static relations = ['protocol', 'token'];

  static recursiveRelations = ['protocol.network'];

  static select = [
    'lending.id',
    'lending.address',
    'lending.pid',
    'lending.liquidity_amount',
    'lending.liquidity_value',
    'lending.supply_amount',
    'lending.supply_value',
    'lending.supply_apr',
    'lending.borrow_amount',
    'lending.borrow_value',
    'lending.borrow_apr',
    'lending.reserve_amount',
    'lending.reserve_value',
    'lending.data',
    'lending.collateral_factor',
    'lending.reserve_factor',
    'lending.link',
    'lending.id',

    'token.name',
    'token.symbol',
    'token.decimals',
    'token.address',
    'token.total_supply',
    'token.price_value',
    'token.icon_link',

    'protocol.id',
    'protocol.name',
    'protocol.link',
    'protocol.logo_link',

    'protocol_network.name',
    'protocol_network.sub_name',
    'protocol_network.currency_symbol',
    'protocol_network.explorer_url',
  ];
}
