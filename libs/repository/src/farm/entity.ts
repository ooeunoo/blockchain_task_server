import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
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
@Index('idx_farm_1', ['protocol', 'address'], { unique: false })
@Index('idx_farm_2', ['protocol', 'pid'], { unique: false })
@Index('idx_farm_3', ['protocol', 'address', 'pid'], { unique: true })
export class Farm extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @ManyToOne(() => Protocol, (protocol) => protocol.farms, { nullable: false })
  protocol: Protocol;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  pid: number;

  @Column()
  assets: string;

  @ManyToMany(() => Token, (token) => token.farm_stake_tokens)
  @JoinTable()
  stake_tokens: Token[];

  @ManyToMany(() => Token, (token) => token.farm_reward_tokens)
  @JoinTable()
  reward_tokens: Token[];

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  liquidity_amount: string;

  @Column('decimal', { precision: 65, scale: 22, default: 0 })
  liquidity_value: string;

  @Column({ nullable: true })
  apy: string;

  @Column({ nullable: true })
  apr: string;

  @Column({ nullable: true })
  data: string;

  @Column({ nullable: true })
  link: string;

  @BeforeInsert()
  @BeforeUpdate()
  toCheckSum(): void {
    if (!this.address) {
      this.address = ethers.utils.getAddress(this.address);
    }
  }

  static relations = ['protocol', 'stake_tokens', 'reward_tokens'];

  static recursiveRelations = [
    'protocol.network',
    'stake_tokens.pair0',
    'stake_tokens.pair1',
    'reward_tokens.pair0',
    'reward_tokens.pair1',
  ];

  static select = [
    'farm.id',
    'farm.name',
    'farm.address',
    'farm.pid',
    'farm.assets',
    'farm.liquidity_amount',
    'farm.liquidity_value',
    'farm.data',
    'farm.apr',
    'farm.link',

    'protocol.id',
    'protocol.name',
    'protocol.link',
    'protocol.logo_link',

    'protocol_network.name',
    'protocol_network.sub_name',
    'protocol_network.chain_id',
    'protocol_network.currency_symbol',
    'protocol_network.explorer_url',

    'stake_tokens.name',
    'stake_tokens.symbol',
    'stake_tokens.decimals',
    'stake_tokens.address',
    'stake_tokens.total_supply',
    'stake_tokens.price_value',
    'stake_tokens.icon_link',

    'stake_tokens_pair0.name',
    'stake_tokens_pair0.symbol',
    'stake_tokens_pair0.decimals',
    'stake_tokens_pair0.address',
    'stake_tokens_pair0.total_supply',
    'stake_tokens_pair0.price_value',
    'stake_tokens_pair0.icon_link',

    'stake_tokens_pair1.name',
    'stake_tokens_pair1.symbol',
    'stake_tokens_pair1.decimals',
    'stake_tokens_pair1.address',
    'stake_tokens_pair1.total_supply',
    'stake_tokens_pair1.price_value',
    'stake_tokens_pair1.icon_link',

    'reward_tokens.name',
    'reward_tokens.symbol',
    'reward_tokens.decimals',
    'reward_tokens.address',
    'reward_tokens.total_supply',
    'reward_tokens.price_value',
    'reward_tokens.icon_link',

    'reward_tokens_pair0.name',
    'reward_tokens_pair0.symbol',
    'reward_tokens_pair0.decimals',
    'reward_tokens_pair0.address',
    'reward_tokens_pair0.total_supply',
    'reward_tokens_pair0.price_value',
    'reward_tokens_pair0.icon_link',

    'reward_tokens_pair1.name',
    'reward_tokens_pair1.symbol',
    'reward_tokens_pair1.decimals',
    'reward_tokens_pair1.address',
    'reward_tokens_pair1.total_supply',
    'reward_tokens_pair1.price_value',
    'reward_tokens_pair1.icon_link',
  ];
}
