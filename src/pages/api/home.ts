import { NextApiRequest, NextApiResponse } from 'next'
import { polygonProvider } from '@/lib/ethers'
import { TETU_EQI_ADDRESS, XTETU_ADDRESS, DXTETU_ADDRESS, TETU_CONTRACT_READER_POLYGON_ADDRESS, TETUBAL_ADDRESS, TETUQI_ADDRESS, QIPOWAH_ADDRESS, TETU_TETUQI_QI_LP_ADDRESS } from '@/constants'

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
    getTotalSupply(polygonProvider, DXTETU_ADDRESS),
    getTetuTvlUsd(polygonProvider, TETU_CONTRACT_READER_POLYGON_ADDRESS, TETUBAL_ADDRESS),
    getCoingeckoPrice('qi-dao'),
    getTotalSupply(polygonProvider, TETUQI_ADDRESS),
    getBalanceOf(polygonProvider, QIPOWAH_ADDRESS, TETU_EQI_ADDRESS),
    getPricePerFullShare(polygonProvider, XTETU_ADDRESS),
    getPpfsApr(polygonProvider, TETU_CONTRACT_READER_POLYGON_ADDRESS, TETU_TETUQI_QI_LP_ADDRESS)
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
