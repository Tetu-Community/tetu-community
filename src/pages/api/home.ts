import { NextApiRequest, NextApiResponse } from 'next'
import { polygonProvider } from '../../lib/ethers'

import {
  getCoingeckoPrice,
  getTetuCirculatingSupply,
  getTotalSupply,
  getPricePerFullShare,
  getTetuTvlUsd,
  getPpfsApr,
  getBalanceOf
} from './shared'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [
    tetuPrice,
    tetuCirculatingSupply,
    dxTetuSupply,
    veBalLockedUsd,
    qiPrice,
    numQiLocked,
    totalEQi,
    xTetuPpfs,
    tetuQiLpStakingApr
  ] = await Promise.all([
    getCoingeckoPrice('tetu'),
    getTetuCirculatingSupply(),
    getTotalSupply(polygonProvider, '0xAcEE7Bd17E7B04F7e48b29c0C91aF67758394f0f'),
    getTetuTvlUsd(polygonProvider, '0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da', '0x7fC9E0Aa043787BFad28e29632AdA302C790Ce33'),
    getCoingeckoPrice('qi-dao'),
    getTotalSupply(polygonProvider, '0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768'),
    getBalanceOf(polygonProvider, '0x16591AD1634d46a1eeAe3b8Cbd438814fB94f9d7', '0x42702c28415aA436DBbd200e3E49215d75232ff1'),
    getPricePerFullShare(polygonProvider, '0x225084D30cc297F3b177d9f93f5C3Ab8fb6a1454'),
    getPpfsApr(polygonProvider, '0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da', '0x53d034c0d2680f39c61c9e7a03fb707a2a1b6e9b')
  ])

  const marketCap = tetuPrice.times(tetuCirculatingSupply)
  const eQiLockedUsd = numQiLocked.times(qiPrice)

  res.status(200).json({
    qiPrice,
    tetuPrice,
    tetuCirculatingSupply,
    dxTetuSupply,
    marketCap,
    veBalLockedUsd,
    eQiLockedUsd,
    numQiLocked,
    totalEQi,
    xTetuPpfs,
    tetuQiLpStakingApr
  })
}

export default handler
