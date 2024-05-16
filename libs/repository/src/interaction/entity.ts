import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ethers } from 'ethers';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { StatusEntity } from '../../utils/StatusEntity';
import { Network } from '../network/entity';

@Entity()
@Unique(['network', 'from_address', 'to_address'])
@Index('idx_interaction_1', ['from_address'], { unique: false })
@Index('idx_interaction_2', ['network', 'from_address'], { unique: false })
export class Interaction extends IdEntity(StatusEntity(EmptyEntity)) {
  @ManyToOne(() => Network, (network) => network.interactions, {
    nullable: false,
  })
  network: Network;

  @Column({ nullable: true })
  from_address: string;

  @Column({ nullable: true })
  to_address: string;

  @BeforeInsert()
  @BeforeUpdate()
  toCheckSum(): void {
    if (!this.from_address) {
      this.from_address = ethers.utils.getAddress(this.from_address);
    }
    if (!this.to_address) {
      this.to_address = ethers.utils.getAddress(this.to_address);
    }
  }

  static relations = ['network'];

  static recursiveRelations = [];

  static select = [
    'interaction.from_address',
    'interaction.to_address',

    'network_chain_id',
  ];
}
