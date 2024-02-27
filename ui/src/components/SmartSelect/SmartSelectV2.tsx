import { useState } from 'react'
import { Combobox, InputBase, useCombobox } from '@mantine/core'
import { Identifier } from '@src/types'
import { useLogger } from '@mantine/hooks'
import { find } from 'lodash'

interface SelectCreatableProps {
    data: { value: string; id: Identifier }[]
    selected: { value: string; id: Identifier } | undefined
    createData: (value: string) => void
    setData: (id: Identifier | string) => void
}

export const SelectCreatable: React.FC<SelectCreatableProps> = ({ data, createData, selected, setData }) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | undefined>(selected?.value)
    const [search, setSearch] = useState(selected?.value || '')

    useLogger('SmartSelectV2', [search, value, selected])
    console.log('SmartSelectV2 log', search, value, selected, data)

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
                    // const data_id = find<{ id: Identifier; value: string }>(
                    //     data,
                    //     (element: { id: string; value: string }) => element.value === submitted_val
                    // )
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
                    rightSection={<Combobox.Chevron />}
                    value={search}
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
                    placeholder='Search value'
                    rightSectionPointerEvents='none'
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
