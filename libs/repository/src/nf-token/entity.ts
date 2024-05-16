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

@Entity()
@Index('idx_nfToken_1', ['protocol', 'address', 'index'])
export class NFToken extends IdEntity(TimeEntity(StatusEntity(EmptyEntity))) {
  @ManyToOne(() => Protocol, (protocol) => protocol.nfTokens, {
    nullable: false,
  })
  protocol: Protocol;

  @Column()
  address: string;

  @Column()
  index: number;

  @Column({ nullable: true })
  token_uri: string;

  @Column({ nullable: true })
  image_or_animation_uri: string;

  @BeforeInsert()
  @BeforeUpdate()
  toCheckSum(): void {
    if (!this.address) {
      this.address = ethers.utils.getAddress(this.address);
    }
  }

  static relations = ['protocol'];

  static recursiveRelations = ['protocol.network'];

  static select = [
    'nf_token.address',
    'nf_token.index',
    'nf_token.token_uri',
    'nf_token.image_or_animation_uri',

    'protocol.name',
    'protocol.link',
    'protocol.logo_link',

    'protocol_network.name',
    'protocol_network.sub_name',
    'protocol_network.currency_symbol',
    'protocol_network.explorer_url',
  ];
}
