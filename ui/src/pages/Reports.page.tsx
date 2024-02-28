import { Group } from '@mantine/core'
import { DateInput } from '@mantine/dates'

export const ReportsPage = () => {
    const debug = 123

    return (
        <Group>
            <DateInput
                label='Start date'
                placeholder='Start date'
            />
            <DateInput
                label='End date'
                placeholder='End date'
            />
        </Group>
    )
}
