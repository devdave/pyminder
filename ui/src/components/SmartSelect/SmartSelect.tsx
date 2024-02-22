// @flow
import * as React from 'react'
import { useState } from 'react'
import { Combobox, InputBase, useCombobox } from '@mantine/core'

type Props = {
    allData: { value: string; id: string }[]
    addData: (newValue: string) => void
    setData: (newValue: string) => void
    placeholder: string
}

export const SmartSelect: React.FC<Props> = ({ allData, addData, setData, placeholder }) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [, setValue] = useState<string | null>(null)
    const [search, setSearch] = useState<string>('')

    // const exactOptionMatch = allData.some((item) => item.value === search)

    const filteredData = allData.filter(
        (item: { value: string; id: string }) => item.value.toLowerCase().indexOf(search.toLowerCase()) !== -1
    )

    const options = filteredData.map((option) => (
        <Combobox.Option
            value={option.value}
            key={option.id}
        >
            {option.value}
        </Combobox.Option>
    ))

    const createOnEnter = (evt: { code: string }) => {
        if (evt.code.toLowerCase() === 'enter') {
            const shouldMakeNew = options.length <= 0
            if (shouldMakeNew) {
                addData(search)
                combobox.closeDropdown()
            } else if (options?.length === 1) {
                const selected = filteredData?.at(0)
                if (selected) {
                    setData(selected.id)
                }
            }
        }
    }

    return (
        <>
            <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    if (val === '$create') {
                        addData(search)
                        setValue(search)
                        setSearch('')
                    } else {
                        setValue(val)
                        setSearch(search)
                        setData(JSON.stringify(val))
                    }
                    combobox.closeDropdown()
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<Combobox.Chevron />}
                        value={search}
                        onKeyUp={createOnEnter}
                        onChange={(event) => {
                            combobox.openDropdown()
                            combobox.updateSelectedOptionIndex()
                            setSearch(event.currentTarget.value)
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown()
                            // setSearch(value || '');
                        }}
                        placeholder={placeholder}
                        rightSectionPointerEvents='none'
                    />
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {options}
                        {((options ? options.length <= 0 : true) || search.trim().length === 0) && (
                            <Combobox.Option value='$create'>
                                +Select or press enter to create {search}
                            </Combobox.Option>
                        )}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </>
    )
}
