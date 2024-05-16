import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Table } from 'typeorm';
import * as crypto from 'crypto';

export class ConstraintSnakeNamingStrategy extends SnakeNamingStrategy {
  constructor() {
    super();
  }

  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join('_');

    return `pk_${table}_${columnsSnakeCase}`;
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTablePath?: string,
  ): string {
    tableOrName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const name = columnNames.reduce(
      (name, column) => `${name}_${column}`,
      `${tableOrName}_${referencedTablePath}`,
    );

    return `fk_${crypto.createHash('md5').update(name).digest('hex')}`;
  }
}
