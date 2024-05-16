import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
} from 'typeorm';
import { ethers } from 'ethers';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';
import { Network } from '../network/entity';

@Entity()
@Index('idx_abi_1', ['network', 'address'], { unique: true })
export class Abi extends IdEntity(EmptyEntity) {
  @ManyToOne(() => Network, (network) => network.abis, { nullable: false })
  network: Network;

  @Column()
  address: string;

  @Column('longtext')
  data: string;

  getABI(): unknown {
    return JSON.parse(JSON.stringify(this.data));
  }

  @BeforeInsert()
  @BeforeUpdate()
  toCheckSum(): void {
    if (!this.address) {
      this.address = ethers.utils.getAddress(this.address);
    }
  }

  static relations = ['network'];

  static recursiveRelations = [];

  static select = [];
}
