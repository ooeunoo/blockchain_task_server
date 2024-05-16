import { Network } from '@libs/repository/network/entity';
import { Provider } from '@ethersproject/providers';

export interface ExtendNetworkProvider extends Network {
  providers: Provider[];
}
