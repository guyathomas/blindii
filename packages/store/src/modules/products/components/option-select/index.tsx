import clsx from "clsx"
import React from "react"

type OptionSelectProps = {
  optionValues: {
    title?: string
    value: string
    id: string
    subtitle?: string
  }[]
  current: string
  updateOption: (option: Record<string, string>) => void
  title: string
  subtitle?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  optionValues,
  current,
  updateOption,
  title,
}) => {
  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-base-semi">Select {title}</span>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {optionValues.map(({ value, title, id, subtitle }) => {
          return (
            <button
              onClick={() => updateOption({ [id]: value })}
              key={value}
              className={clsx(
                "border-gray-200 border text-xsmall-regular h-[50px] transition-all duration-200",
                { "border-gray-900": value === current }
              )}
            >
              <div>{title}</div>
              <div>{subtitle}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
