import { INestApplication, Injectable } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from '../../common/config/config.service';

@Injectable()
export class SwaggerConfigService {
  create(app: INestApplication) {
    const swaggerOptions = new DocumentBuilder()
      .setTitle(config.swaggerTitle)
      .setDescription(config.swaggerDescription)
      .setVersion(config.swaggerVersion)
      .addTag(config.swaggerTag)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup('api', app, document);
  }
}
