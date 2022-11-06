import { FC } from 'react'
import { Tooltip } from 'flowbite-react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

const InfoBubble: FC<{ loading: boolean; title: string; tooltip?: string; children: React.ReactNode }> = ({
	loading,
	title,
	tooltip,
	children,
}) => {
	return (
		<div className="p-4 bg-slate-800 rounded-md">
			{loading ? (
				<div className="text-center text-2xl blur-md">100,000,000</div>
			) : (
				<div className="text-center text-2xl">
					{children}
					{tooltip ? (
						<>
							&nbsp;
							<div className="tooltip-wrapper">
								<Tooltip content={tooltip} placement="bottom">
									<QuestionMarkCircleIcon className="w-4 h-4" />
								</Tooltip>
							</div>
						</>
					) : (
						''
					)}
				</div>
			)}
			<div className="text-center text-gray-400">{title}</div>
		</div>
	)
}

export default InfoBubble
