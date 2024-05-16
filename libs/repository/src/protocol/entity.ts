import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TimeEntity } from '../../utils/TimeEntity';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { StatusEntity } from '../../utils/StatusEntity';
import { Network } from '../network/entity';
import { Token } from '../token/entity';
import { NFToken } from '../nf-token/entity';
import { Farm } from '../farm/entity';
import { Lending } from '../lending/entity';

@Entity()
export class Protocol extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @ManyToOne(() => Network, (network) => network.protocols, { nullable: false })
  network: Network;

  @Column()
  name: string;

  @OneToOne(() => Token, { nullable: true })
  @JoinColumn()
  token: Token;

  @Column({ default: false })
  use_amm: boolean;

  @Column({ default: false })
  use_farm: boolean;

  @Column({ default: false })
  use_nft: boolean;

  @Column({ default: false })
  use_lending: boolean;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  logo_link: string;

  @OneToMany(() => Farm, (farm) => farm.protocol)
  farms: Farm[];

  @OneToMany(() => Lending, (lending) => lending.protocol)
  lendings: Lending[];

  @OneToMany(() => NFToken, (nfToken) => nfToken.protocol)
  nfTokens: NFToken[];

  static relations = ['network', 'token'];

  static recursiveRelations = [];

  static select = [
    'protocol.id',
    'protocol.name',
    'protocol.use_amm',
    'protocol.use_farm',
    'protocol.use_lending',
    'protocol.use_nft',
    'protocol.link',
    'protocol.logo_link',

    'network.name',
    'network.sub_name',
    'network.currency_symbol',
    'network.explorer_url',

    'token.name',
    'token.symbol',
    'token.decimals',
    'token.address',
    'token.total_supply',
    'token.price_value',
    'token.icon_link',
  ];
}
