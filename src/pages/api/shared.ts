import axios from 'axios'
import { request, gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import { Contract } from '@ethersproject/contracts'
import { getOrSetCache } from '@/lib/cache'
import ms from 'ms'

const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql'

// cached for 5 minutes
export async function getCoingeckoPrice(id: string): Promise<BigNumber> {
  const rawPrice = await getOrSetCache(
    `cg-raw-price-${id}`,
    async () => {
      const resp = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
      return resp.data.market_data.current_price.usd
    },
    ms('5min')
  )

  return BigNumber(rawPrice)
}

export async function getTotalSupply(provider: any, address: string): Promise<BigNumber> {
  const c = new Contract(
    address,
    ['function totalSupply() external view returns (uint)'],
    provider
  )

  return BigNumber((await c.totalSupply()).toString()).shiftedBy(-18)
}

export async function getPricePerFullShare(provider: any, address: string): Promise<BigNumber> {
  const c = new Contract(
    address,
    ['function getPricePerFullShare() external view returns (uint)'],
    provider
  )

  return BigNumber((await c.getPricePerFullShare()).toString()).shiftedBy(-18)
}

export async function getTetuCirculatingSupply(): Promise<BigNumber> {
  const resp = await axios.get('https://api.tetu.io/api/v1/info/circulationSupply')
  return BigNumber(resp.data)
}

export async function getTetuTvlUsd(provider: any, contractReaderAddress: string, vaultAddress: string): Promise<BigNumber> {
  const c = new Contract(
    contractReaderAddress,
    ['function vaultTvlUsdc(address _vault) public view returns (uint256)'],
    provider
  )

  return BigNumber((await c.vaultTvlUsdc(vaultAddress)).toString()).shiftedBy(-18)
}

export async function getPpfsApr(provider: any, contractReaderAddress: string, vaultAddress: string): Promise<BigNumber> {
  const c = new Contract(
    contractReaderAddress,
    ['function vaultPpfsApr(address _vault) public view returns (uint256)'],
    provider
  )

  return BigNumber((await c.vaultPpfsApr(vaultAddress)).toString()).shiftedBy(-18)
}

export async function getBalanceOf(provider: any, contractAddress: string, userAddress: string): Promise<BigNumber> {
  const c = new Contract(
    contractAddress,
    ['function balanceOf(address _user) public view returns (uint256)'],
    provider
  )

  return BigNumber((await c.balanceOf(userAddress)).toString()).shiftedBy(-18)
}

export async function getSnapshotData(proposalId: string): Promise<any> {
  const resp = await request(SNAPSHOT_GRAPHQL_ENDPOINT, gql`
    query {
      proposals (
        where: {
          id: "${proposalId}"
        }
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_by_strategy
        scores_total
        scores_updated
        author
        space {
          id
          name
        }
      }

      votes (
        first: 10000,
        skip: 0,
        where: {
          proposal: "${proposalId}"
        }
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        voter
        vp
        created
        choice
      }
    }
  `)

  return {
    proposal: resp.proposals[0],
    votes: resp.votes
  }
}
