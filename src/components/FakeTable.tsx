import { FC } from 'react'
import range from 'lodash.range'

const FakeTable: FC = () => {
	return (
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
						{range(0, 10).map(function (n, i) {
							return (
								<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={i}>
									<th
										scope="row"
										className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
									>
										Apple MacBook Pro 17&quot;
									</th>
									<td className="py-4 px-6">Sliver</td>
									<td className="py-4 px-6">Laptop</td>
									<td className="py-4 px-6">$2999</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default FakeTable
