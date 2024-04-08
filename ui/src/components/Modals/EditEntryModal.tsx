import { modals } from '@mantine/modals'
import { Text, Button } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

export const EditEntryModal = () =>
    new Promise<boolean>((resolve) => {
        const handleSubmit = () => {
            console.log('edited')
            resolve(true)
        }

        modals.open({
            title: 'Edit Entry',
            children: (
                <>
                    <Text>Edit Entry</Text>
                    <DateTimePicker label='Started at' />
                    <DateTimePicker label='Finished at' />
                    <Button onClick={() => handleSubmit()}>Update</Button>
                </>
            )
        })
    })
