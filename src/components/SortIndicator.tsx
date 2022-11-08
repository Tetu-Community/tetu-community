import { FC } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

const SortIndicator: FC<{ sortBy: any; sortDirection: any; thisIndex: any }> = ({
	sortBy,
	sortDirection,
	thisIndex,
}) => {
	if (sortBy !== thisIndex) return

	if (sortDirection === 'desc') {
		return <ChevronDownIcon className="inline w-2" />
	} else {
		return <ChevronUpIcon className="inline w-2" />
	}
}

export default SortIndicator
