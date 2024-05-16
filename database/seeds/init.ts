/* eslint-disable @typescript-eslint/no-var-requires */
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Network } from '../../libs/repository/src/network/entity';
import { Token } from '../../libs/repository/src/token/entity';
import { Protocol } from '../../libs/repository/src/protocol/entity';
import { Scheduler } from '../../libs/repository/src/scheduler/entity';
import { Interaction } from '../../libs/repository/src/interaction/entity';
import { Abi } from '../../libs/repository/src/abi/entity';

export default class Create implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .getRepository('network')
      .save(require('./data/network.json'));

    await connection.getRepository('token').save(require('./data/token.json'));

    await connection
      .getRepository('protocol')
      .save(require('./data/protocol.json'));

    await connection.getRepository('abi').save(require('./data/abi.json'));

    await connection
      .getRepository('scheduler')
      .save(require('./data/scheduler.json'));

    await connection
      .getRepository('interaction')
      .save(require('./data/interaction.json'));
  }
}
