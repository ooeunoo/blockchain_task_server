import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TimeEntity } from '../../utils/TimeEntity';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { StatusEntity } from '../../utils/StatusEntity';
import { Abi } from '../abi/entity';
import { Token } from '../token/entity';
import { Protocol } from '../protocol/entity';
import { Interaction } from '../interaction/entity';

@Entity()
@Index('idx_network_1', ['chain_id'])
export class Network extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @Column()
  name: string;

  @Column()
  sub_name: string;

  @Column()
  currency_symbol: string;

  @Column({ type: 'bigint' })
  chain_id: number;

  @Column()
  multi_call_address: string;

  @Column('text')
  http: string[];

  @Column()
  block_time_sec: number;

  @Column()
  explorer_url: string;

  @OneToMany(() => Protocol, (protocol) => protocol.network)
  protocols: Protocol[];

  @OneToMany(() => Abi, (abi) => abi.network)
  abis: Abi[];

  @OneToMany(() => Token, (token) => token.network)
  tokens: Token[];

  @OneToMany(() => Interaction, (interaction) => interaction.network)
  interactions: Interaction[];

  static relations = [];

  static recursiveRelations = [];

  static select = [
    'network.name',
    'network.sub_name',
    'network.currency_symbol',
    'network.explorer_url',
  ];
}
