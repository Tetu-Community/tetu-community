import BigNumber from 'bignumber.js'
import { NextApiRequest, NextApiResponse } from 'next'
import { mainnetProvider, polygonProvider } from '../../lib/ethers'

import {
  getCoingeckoPrice,
  getSnapshotData,
  getTotalSupply
} from './shared'

const SNAPSHOT_PROPOSAL_ID = '0x0d8a15d945f8d4e46fdab28bbf39e38f43cbcb5aed5c42d7025305bfa9d94bcc'

// TODO: get from chain
const BRIBES_USD = {
  'B-tetuQi-Stable (0xc9cd2b)': BigNumber(5291.29),
  '20WETH-80CRE8R (0x077794)': BigNumber(100)
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [
    balPrice,
    tetuBalTotalSupply,
    veBalTotalSupply,
    snapshotData,
    bribesUsd
  ] = await Promise.all([
    getCoingeckoPrice('balancer'),
    getTotalSupply(polygonProvider, '0x7fC9E0Aa043787BFad28e29632AdA302C790Ce33'),
    getTotalSupply(mainnetProvider, '0xC128a9954e6c874eA3d62ce62B468bA073093F25'),
    getSnapshotData(SNAPSHOT_PROPOSAL_ID),
    BRIBES_USD
  ])

  res.status(200).json({
    balPrice,
    tetuBalTotalSupply,
    veBalTotalSupply,
    snapshotData,
    bribesUsd
  })
}

export default handler
