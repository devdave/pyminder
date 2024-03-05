import { LoadingOverlay, Text, Table } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { Identifier, Project } from '@src/types'
import { useAppContext } from '@src/App.context'

export const ProjectsPage = () => {
    const { projectBroker } = useAppContext()

    const { client_id } = useParams()
    const { data: allProjects, isLoading: allProjectsAreLoading } = projectBroker.useGetAllByClient(
        client_id as Identifier,
        true
    )

    if (allProjectsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allProjects) {
        return <Text>Error loading projects</Text>
    }

    return (
        <>
            <Text>Projects for {client_id}</Text>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allProjects.map((project: Project) => (
                        <Table.Tr key={project.id}>
                            <Table.Td>{project.name}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    )
}
