import { PrimaryGeneratedColumn } from 'typeorm';
import { Constructor } from './Constructor';

export function UuidEntity<TUuid extends Constructor>(Uuid: TUuid) {
  abstract class AbstractEntity extends Uuid {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  }

  return AbstractEntity;
}
