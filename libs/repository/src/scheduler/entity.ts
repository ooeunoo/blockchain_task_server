import { Column, Entity } from 'typeorm';
import { UuidEntity } from '../../utils/UuidEntity';
import { TimeEntity } from '../../utils/TimeEntity';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { StatusEntity } from '../../utils/StatusEntity';

@Entity()
export class Scheduler extends UuidEntity(
  TimeEntity(StatusEntity(EmptyEntity)),
) {
  @Column()
  type: string;

  @Column()
  identity: string;

  @Column()
  cron: string;

  @Column({ nullable: true, default: 0 })
  block_number: number;

  @Column({ nullable: true })
  pid: number;

  @Column({ default: false })
  error: boolean;

  @Column({ default: 0 })
  process: boolean;

  updateBlockNumber(blockNumber: number) {
    this.block_number = blockNumber;
  }

  updatePid(pid: number) {
    this.block_number = pid;
  }

  static relations = [];

  static recursiveRelations = [];

  static select = [];
}
