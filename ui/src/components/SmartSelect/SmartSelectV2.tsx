import React, { useState } from 'react'
import { CloseButton, Combobox, InputBase, useCombobox } from '@mantine/core'
import { Identifier } from '@src/types'
import { find } from 'lodash'

interface SelectCreatableProps {
    data: { value: string; id: Identifier }[]
    selected: { value: string; id: Identifier } | undefined
    createData: (value: string) => void
    setData: (id: Identifier | string) => void
    onClear: () => void
    placeholder: string
}

export const SelectCreatable: React.FC<SelectCreatableProps> = ({
    data,
    createData,
    selected,
    setData,
    onClear,
    placeholder
}) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | undefined>(selected?.value)
    const [search, setSearch] = useState(selected?.value || '')

    const exactOptionMatch = data.some((item) => item.value === search)
    const filteredOptions = exactOptionMatch
        ? data
        : data.filter((item) => item.value.toLowerCase().includes(search.toLowerCase().trim()))

    const options = filteredOptions.map((item) => (
        <Combobox.Option
            key={item.id as unknown as string}
            value={item.id as unknown as string}
        >
            {item.value}
        </Combobox.Option>
    ))

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(submitted_val) => {
                if (submitted_val === '$create') {
                    createData(search)
                    setValue(search)
                } else {
                    const selected_data = find(data, (element) => element.id === submitted_val)

                    // const data_id = { id: 2, value: 'self' }
                    console.log('Value selected', submitted_val, selected_data)
                    if (submitted_val) {
                        setValue(selected_data?.value || '')
                        setSearch(selected_data?.value || '')
                        if (selected_data) {
                            setData(selected_data.id as Identifier)
                        }
                    }
                }

                combobox.closeDropdown()
            }}
        >
            <Combobox.Target>
                <InputBase
                    rightSection={
                        value !== undefined ? (
                            <CloseButton
                                size='sm'
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    setValue(undefined)
                                    setSearch('')
                                    onClear()
                                }}
                                aria-label='Clear value'
                            />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                    value={search}
                    rightSectionPointerEvents={value === undefined ? 'none' : 'all'}
                    onChange={(event) => {
                        combobox.openDropdown()
                        combobox.updateSelectedOptionIndex()
                        setSearch(event.currentTarget.value)
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown()
                        setSearch(value || '')
                    }}
                    placeholder={placeholder}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options}
                    {!exactOptionMatch && search.trim().length > 0 && (
                        <Combobox.Option value='$create'>+ Create {search}</Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}
