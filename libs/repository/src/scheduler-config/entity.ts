import { Column, Entity } from 'typeorm';
import { EmptyEntity } from '../../utils/EmptyEntity';
import { IdEntity } from '../../utils/IdEntity';

@Entity()
export class SchedulerConfig extends IdEntity(EmptyEntity) {
  @Column()
  key: string;

  @Column()
  value: string;

  static relations = [];

  static recursiveRelations = [];

  static select = [];
}
