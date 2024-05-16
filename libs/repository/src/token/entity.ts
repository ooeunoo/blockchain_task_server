import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ethers } from 'ethers';
import { TimeEntity } from '../../utils/TimeEntity';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { StatusEntity } from '../../utils/StatusEntity';
import { Network } from '../network/entity';
import { TokenType } from './constant';
import { Farm } from '../farm/entity';
import { Lending } from '../lending/entity';

@Entity()
@Index('idx_token_1', ['network', 'address'], { unique: true })
export class Token extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @ManyToOne(() => Network, (network) => network.tokens, { nullable: false })
  network: Network;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: TokenType;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  address: string;

  @Column()
  decimals: number;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  total_supply: string;

  @ManyToOne(() => Token, (token) => token.pair0, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  pair0: Token;

  @ManyToOne(() => Token, (token) => token.pair1, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  pair1: Token;

  @Column({ nullable: true })
  price_address: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  price_value: string;

  @Column({ nullable: true })
  icon_link: string;

  @Column({ default: false })
  swap_base: boolean;

  @OneToOne(() => Token, (token) => token.wrapped, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wrapped: Token;

  @ManyToMany(() => Farm, (farm) => farm.stake_tokens)
  farm_stake_tokens: Farm[];

  @ManyToMany(() => Farm, (farm) => farm.reward_tokens)
  farm_reward_tokens: Farm[];

  @OneToMany(() => Lending, (lending) => lending.token)
  lendings: Lending[];

  @BeforeInsert()
  checkInsert(): void {
    if (!this.address) {
      this.address = ethers.utils.getAddress(this.address);
    }
  }

  static relations = ['network', 'pair0', 'pair1', 'wrapped'];

  static recursiveRelations = [];

  static select = [
    'token.type',
    'token.name',
    'token.symbol',
    'token.decimals',
    'token.address',
    'token.total_supply',
    'token.price_value',
    'token.icon_link',

    'network.name',
    'network.sub_name',
    'network.currency_symbol',
    'network.chain_id',
    'network.explorer_url',

    'pair0.name',
    'pair0.symbol',
    'pair0.address',
    'pair0.total_supply',
    'pair0.decimals',
    'pair0.price_value',
    'pair0.icon_link',

    'pair1.name',
    'pair1.symbol',
    'pair1.address',
    'pair1.total_supply',
    'pair1.decimals',
    'pair1.price_value',
    'pair1.icon_link',

    'wrapped.name',
    'wrapped.symbol',
    'wrapped.address',
    'wrapped.total_supply',
    'wrapped.name',
    'wrapped.decimals',
    'wrapped.price_value',
    'wrapped.icon_link',
  ];
}
