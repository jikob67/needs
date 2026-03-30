
import { CryptoWallet } from './types';

export interface ExtendedCryptoWallet extends CryptoWallet {
  explorerUrl: string;
  hashRegex: RegExp;
}

export const CRYPTO_WALLETS: ExtendedCryptoWallet[] = [
  { 
    name: 'Solana', 
    symbol: 'SOL', 
    address: 'F2UJS1wNzsfcQTknPsxBk7B25qWbU9JtiRW1eRgdwLJY',
    explorerUrl: 'https://solscan.io/tx/',
    hashRegex: /^[1-9A-HJ-NP-Za-km-z]{32,88}$/ // Solana Base58 hash
  },
  { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    explorerUrl: 'https://etherscan.io/tx/',
    hashRegex: /^0x([A-Fa-f0-9]{64})$/ 
  },
  { 
    name: 'Monad', 
    symbol: 'MON', 
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    explorerUrl: 'https://monad.xyz/',
    hashRegex: /^0x([A-Fa-f0-9]{64})$/
  },
  { 
    name: 'Sui', 
    symbol: 'SUI', 
    address: '0x41629e22deff6965100a4c28567dea45036d0360e6126a9c7f9c8fb1860a36c4',
    explorerUrl: 'https://suiscan.xyz/tx/',
    hashRegex: /^[1-9A-HJ-NP-Za-km-z]{43,44}$/
  },
  { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    address: 'bc1q9s855ehn959s5t2g6kjt9q7pt5t55n9gq7gpd7',
    explorerUrl: 'https://www.blockchain.com/btc/tx/',
    hashRegex: /^[A-Fa-f0-9]{64}$/
  },
];

export const SUPPORT_EMAIL = "jikob67@gmail.com";
export const SUPPORT_LINKS = [
  "https://jacobalcadiapps.wordpress.com",
  "https://jacobalcadiapps.blogspot.com"
];
