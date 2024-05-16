import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class SwapSearchQuery {
  @ApiProperty({
    description: 'input token id',
  })
  @IsNumberString()
  inputTokenId: number;

  @ApiProperty({
    description: 'output token id',
  })
  @IsNumberString()
  outputTokenId: number;

  @ApiProperty({
    description:
      'input token amount, not adjust decimal (if btc 1 to eth >> inputTokenAmount: 1)',
  })
  @IsNumberString()
  inputTokenAmount: string;
}
