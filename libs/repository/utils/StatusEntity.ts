import { Column } from 'typeorm';
import { Constructor } from './Constructor';

export function StatusEntity<TStatus extends Constructor>(Status: TStatus) {
  abstract class AbstractEntity extends Status {
    @Column({ nullable: false, default: true })
    status: boolean;
  }
  return AbstractEntity;
}
