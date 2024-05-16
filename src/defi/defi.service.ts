import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { isUndefined } from '@libs/helper/type';
import { DefiModule } from './defi.module';

@Injectable()
export class DefiService implements OnModuleInit {
  service = new Map<number, any>();

  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit(): Promise<void> {
    const imports = Reflect.getMetadata('imports', DefiModule);

    for (const importModule of imports) {
      const exportModules = Reflect.getMetadata('exports', importModule);

      for (const exportModule of exportModules) {
        const serviceInstance = this.moduleRef.get(exportModule, {
          strict: false,
        });

        const isDeFiService = serviceInstance.isDeFiService;

        if (!isDeFiService || isUndefined(isDeFiService)) {
          continue;
        }

        const { protocol } = serviceInstance;

        this.service.set(protocol.id, serviceInstance);
      }
    }
  }

  getService(id: number) {
    return this.service.get(id);
  }
}
