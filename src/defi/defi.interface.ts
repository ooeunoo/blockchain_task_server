import { Farm } from '@libs/repository/farm/entity';

export interface IDeFiFarm {
  getWalletFarms(farm: Farm[], walletAddress: string): any;
}

export interface IDeFiAMM {
  getWalletAMMs(walletAddress: string, params: any): any;
}

export interface IDeFiLending {
  getWalletLendings(walletAddress: string, params: any): any;
}

export interface IDeFiNFT {
  getWalletNFTokens(walletAddress: string, params: any): any;
}
