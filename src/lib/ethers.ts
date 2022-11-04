import { JsonRpcProvider } from '@ethersproject/providers'

export const polygonProvider = new JsonRpcProvider(
  `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
)

export const mainnetProvider = new JsonRpcProvider(
  `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
)
