import BigNumber from 'bignumber.js'
import { FC, useState } from 'react'
import InfoBubble from '@/components/InfoBubble'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import range from 'lodash.range'
import { ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { useAccount } from 'wagmi'
import Countdown from 'react-countdown'

// https://balancer-dao.gitbook.io/learn-about-balancer/fundamentals/vebal-tokenomics/inflation-schedule
const BAL_EMISSIONS_PER_WEEK = BigNumber(145000)

const SortIndicator: FC<{ sortBy: any, sortDirection: any, thisIndex: any }> = ({ sortBy, sortDirection, thisIndex }) => {
  if (sortBy !== thisIndex) return

  if (sortDirection === 'desc') {
    return <ChevronDownIcon className="inline w-2" />
  } else {
    return <ChevronUpIcon className="inline w-2" />
  }
}

const TetuBal: FC = () => {
  const { isConnected, address } = useAccount()
  const [sortBy, setSortBy] = useState(1)
  const [sortDirection, setSortDirection] = useState('desc')

  function sortTrigger(thisIndex) {
    if (sortBy === thisIndex) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(thisIndex)
      setSortDirection('desc')
    }
  }

  const { data, error } = useSWR('/api/tetu-bal', fetcher)

  const snapshotUrl = data ? `https://snapshot.org/#/${data.snapshotData.proposal.space.id}/proposal/${data.snapshotData.proposal.id}` : undefined

  let tableData = []
  let emissionsPerVeBalUsd = BigNumber(0)
  let totalBribes
  let potentialBribeRoi = BigNumber(0)

  if (data) {
    emissionsPerVeBalUsd = BAL_EMISSIONS_PER_WEEK.div(data.veBalTotalSupply).times(data.balPrice)
    totalBribes = Object.values(data.bribesUsd).reduce((a: BigNumber, b: BigNumber) => a.plus(b), BigNumber(0))
    const dxTetuControlledBalEmissions = BAL_EMISSIONS_PER_WEEK.times(data.tetuBalTotalSupply).div(data.veBalTotalSupply)
    potentialBribeRoi = totalBribes.gt(0) ? dxTetuControlledBalEmissions.times(data.balPrice).times(2).div(totalBribes) : BigNumber('Infinity')
    const totalVote = BigNumber.sum(...data.snapshotData.proposal.scores)
    const myVoteChoicesToVp = {}

    if (isConnected) {
      const myVote = data.snapshotData.votes.find(v => v.voter === address)
      if (myVote) {
        const myVoteVp = BigNumber(myVote.vp)
        const myTotalWeight = Object.values(myVote.choice).reduce((a: BigNumber, b: BigNumber) => a.plus(b), BigNumber(0))
        for (const [id, weight] of Object.entries(myVote.choice)) {
          const choice = data.snapshotData.proposal.choices[parseInt(id, 10) - 1]
          myVoteChoicesToVp[choice] = myVoteVp.times(weight.toString()).div(myTotalWeight.toString())
        }
      }
    }

    for (const i in data.snapshotData.proposal.choices) {
      const choice = data.snapshotData.proposal.choices[i]
      const score = BigNumber(data.snapshotData.proposal.scores[i])
      const bribeUsd = BigNumber(data.bribesUsd[choice] || 0)
      const bribePerVote = score.gt(0) ? bribeUsd.div(score) : (bribeUsd.gt(0) ? bribeUsd : BigNumber(0))
      const emissionsValue = dxTetuControlledBalEmissions.times(score).div(totalVote).times(data.balPrice).times(2) // 2 weeks
      const myVotes = myVoteChoicesToVp[choice] || BigNumber(0)
      const myBribes = bribePerVote.times(myVotes)

      tableData.push([
        choice,
        score,
        bribeUsd,
        bribePerVote,
        emissionsValue,
        myVotes,
        myBribes
      ])
    }
  }

  tableData.sort((a, b) => {
    if (typeof (a[sortBy]) === 'string' && isNaN(a[sortBy])) {
      return a[sortBy].localeCompare(b[sortBy])
    } else {
      return BigNumber(a[sortBy]).gt(b[sortBy]) ? -1 : 1
    }
  })

  if (sortDirection === 'asc') tableData.reverse()

	return (
    <div className="max-w-6xl mx-auto px-6 pt-4">
      <div className="text-justify">
        <p>
          TetuBal is the liquid-staking wrapper for <a href="https://balancer.fi/" target="_blank" rel="noreferrer">Balancer&rsquo;s</a> $veBAL governance token,
          which is created by permanently locking 20WETH-80BAL LP tokens on Ethereum Mainnet.
          Currently, Tetu&rsquo;s $veBAL voting power is split in an interesting way: $TetuBAL tokens in the LP
          are controlled by $dxTETU holders, whereas users who hold $TetuBAL tokens in their wallet
          maintain their governance rights.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 py-6">
        <InfoBubble loading={!data} title="$tetuBAL supply">{data ? BigNumber(data.tetuBalTotalSupply).toFormat(0) : ''}</InfoBubble>
        <InfoBubble loading={!data} title="Emissions per veBAL (weekly)">${emissionsPerVeBalUsd.toFixed(2)}</InfoBubble>
        <InfoBubble loading={!data} title="Total Bribes">${totalBribes ? totalBribes.toFixed(2) : '-'}</InfoBubble>
        <InfoBubble loading={!data} title="Emissions / $1 spent on bribes" tooltip="Maximum ROI, assuming that voters optimize their votes accordingly.">{potentialBribeRoi.eq('Infinity') ? 'Infinity' : '$' + potentialBribeRoi.toFixed(2)}</InfoBubble>
      </div>

      {
        data ?
        (
          <div>
            <div className="flex justify-between">
              <h2 className="text-2xl pb-2">{data.snapshotData.proposal.title}</h2>
              <div className="pt-1">
                Time remaining to vote: &nbsp;
                <div className="inline p-2 rounded-md bg-slate-800 font-mono">
                  <Countdown date={data.snapshotData.proposal.end * 1000} />
                </div>
              </div>
            </div>
            <h3 className="text-sm text-slate-400">
              <a href={snapshotUrl} target="_blank" rel="noreferrer">
                Vote on Snapshot.org &nbsp;
                <ArrowTopRightOnSquareIcon className="inline w-4 mb-1" />
              </a>
            </h3>

            <div className="overflow-x-auto relative pt-4">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="whitespace-nowrap text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(0)}>
                      Title <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={0} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(1)}>
                      Total Votes <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={1} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(2)}>
                      $ Bribes <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={2} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(3)}>
                      $/dxTETU <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={3} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(4)}>
                      Est. Emissions <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={4} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(5)}>
                      My Votes <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={5} />
                    </th>
                    <th scope="col" className="py-3 px-6" onClick={() => sortTrigger(6)}>
                      My Bribes <SortIndicator sortBy={sortBy} sortDirection={sortDirection} thisIndex={6} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    tableData.map(function (td, i) {
                      return (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={i}>
                          <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {td[0]}
                            &nbsp;
                            <a href={`https://etherscan.io/address/${data.choicesToGaugeAddress[td[0]]}`} target="_blank" rel="noreferrer">
                              <ArrowTopRightOnSquareIcon className="inline w-4 mb-1 text-slate-600" />
                            </a>
                          </th>
                          <td className="py-4 px-6">
                            {BigNumber(td[1]).toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            {td[2].gt(0) ? '$' + td[2].toFixed(0) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            {td[3].gt(0) ? '$' + td[3].toFixed(2) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            {td[4].gt(0) ? '$' + td[4].toFixed(2) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            {td[5].gt(0) ? BigNumber(td[5]).toFixed(2) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            {td[6].gt(0) ? '$' + BigNumber(td[6]).toFixed(2) : '-'}
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
                <tfoot>
                  <tr className="bg-white border-b dark:bg-gray-600 dark:border-gray-700">
                    <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Totals:
                    </th>
                    <td className="py-4 px-6">
                      {tableData.map(td => td[1]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      ${tableData.map(td => td[2]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      ${tableData.map(td => td[3]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      ${tableData.map(td => td[4]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {tableData.map(td => td[5]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      ${tableData.map(td => td[6]).reduce((a, b) => a.plus(b), BigNumber(0)).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) :
        (
          <div className="blur-md">
            <h2 className="text-2xl pb-2">BRV-TEST: Gauge Weight for Week of 10th November 2022</h2>
            <h3 className="text-sm text-slate-400">
              <a href="#" target="_blank" rel="noreferrer">
                This goes nowhere
              </a>
            </h3>

            <div className="overflow-x-auto relative pt-4">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="py-3 px-6">
                          Product name
                      </th>
                      <th scope="col" className="py-3 px-6">
                          Color
                      </th>
                      <th scope="col" className="py-3 px-6">
                          Category
                      </th>
                      <th scope="col" className="py-3 px-6">
                          Price
                      </th>
                    </tr>
                </thead>
                <tbody>
                  {
                    range(0, 10).map(function(n, i) {
                      return (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={i}>
                          <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              Apple MacBook Pro 17&quot;
                          </th>
                          <td className="py-4 px-6">
                              Sliver
                          </td>
                          <td className="py-4 px-6">
                              Laptop
                          </td>
                          <td className="py-4 px-6">
                              $2999
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
	)
}

export default TetuBal
