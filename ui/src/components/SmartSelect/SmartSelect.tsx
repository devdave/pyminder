import * as React from 'react'
import { useState } from 'react'
import { ActionIcon, Button, CloseButton, Combobox, Input, InputBase, useCombobox } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { type Identifier } from '@src/types'
import { useLogger } from '@mantine/hooks'

type Props = {
    selected: { value: string | undefined; id: Identifier | undefined }
    allData: { value: string; id: Identifier }[] | undefined
    addData: (newValue: string) => void
    setData: (data_id: Identifier) => void
    deleteData: (id: Identifier, value: string) => void
    clearData: () => void
    placeholder: string
}

export const SmartSelect: React.FC<Props> = ({
    selected,
    allData,
    addData,
    setData,
    deleteData,
    clearData,
    placeholder
}) => {
    useLogger('SmartSelect', ['sm reloaded'])

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | null>(null)
    const [search, setSearch] = useState<string>(selected?.value || '')

    // const exactOptionMatch = allData.some((item) => item.value === search)

    const filteredData = allData?.filter(
        (item: { value: string; id: Identifier }) =>
            item.value.toLowerCase().indexOf(search.toLowerCase()) !== -1
    )

    const handleDelete = (id: Identifier, target_name: string) => {
        setSearch(() => '')
        setValue(() => '')
        clearData()
        deleteData(id, target_name)
    }

    const handleNew = () => {
        const name = window.prompt('Enter new name')
        if (name && name.trim().length > 0) {
            setValue(() => name)
            setSearch(() => name)
            addData(name)
            combobox.closeDropdown()
        }
    }

    const options = filteredData?.map((option) => (
        <Combobox.Option
            selected={option.id === selected?.value}
            value={option.value}
            key={option.id}
            onClick={() => {
                setData(option.id)
                console.log('option set', option.id)
            }}
        >
            {option.value}
            <ActionIcon
                color='red'
                size='xs'
                onClick={() => handleDelete(option.id, option.value)}
            >
                <IconX />
            </ActionIcon>
        </Combobox.Option>
    ))

    const createOnEnter = (evt: { code: string }) => {
        console.log('selected index', combobox.selectedOptionIndex)
        if (evt.code.toLowerCase() === 'enter') {
            const shouldMakeNew = options ? options.length <= 0 : true
            if (shouldMakeNew) {
                addData(search)
                combobox.closeDropdown()
            } else if (options?.length === 1) {
                const lastOption = filteredData?.at(0)
                if (lastOption) {
                    setData(lastOption.id)
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
                    console.log('onsubmit', val)

                    if (val === '$create') {
                        addData(search)
                        setValue(() => search)
                        setSearch(() => search)
                    } else {
                        setValue(val)
                        setSearch(val)
                        console.log('onOptionSubmit', val)
                    }
                    combobox.closeDropdown()
                }}
            >
                <Combobox.Target>
                    <InputBase
                        component='button'
                        type='button'
                        pointer
                        rightSection={
                            value !== null ? (
                                <CloseButton
                                    size='sm'
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                        setValue(null)
                                        setSearch('')
                                    }}
                                    aria-label='Clear value'
                                />
                            ) : (
                                <Combobox.Chevron />
                            )
                        }
                        onKeyUp={createOnEnter}
                        onChange={(event) => {
                            combobox.openDropdown()
                            combobox.updateSelectedOptionIndex()
                            console.log('onChange', event.currentTarget.value)
                            setSearch(event.currentTarget.value)
                            setValue(event.currentTarget.value)
                            if (!event.currentTarget.value || event.currentTarget.value === '') {
                                clearData()
                            }
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown()
                            console.log('onblur', value, search)
                            // setSearch(value || '');
                        }}
                        rightSectionPointerEvents={value === null ? 'none' : 'all'}
                    >
                        {value || <Input.Placeholder>{placeholder}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {options}
                        <Button onClick={handleNew}>Create new</Button>
                        {(options ? options.length <= 0 : true) && search.trim().length > 0 && (
                            <Combobox.Option
                                value='$create'
                                key={-1}
                            >
                                +Select or press enter to create {search}
                            </Combobox.Option>
                        )}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </>
    )
}
