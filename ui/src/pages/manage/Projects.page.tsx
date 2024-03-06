import { LoadingOverlay, Text, Table, Title, Button, Breadcrumbs, Checkbox } from '@mantine/core'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Identifier, Project } from '@src/types'
import { useAppContext } from '@src/App.context'

export const ProjectsPage = () => {
    const { api, projectBroker, clientBroker } = useAppContext()

    const { client_id } = useParams()
    const { data: allProjects, isLoading: allProjectsAreLoading } = projectBroker.useGetAllByClient(
        client_id as Identifier,
        true
    )

    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    if (allProjectsAreLoading || clientRecordLoading) {
        return <LoadingOverlay visible />
    }

    if (!allProjects || !clientRecord) {
        return <Text>Error loading projects</Text>
    }

    const items = [{ title: 'Clients', href: '/manage' }].map((item, index) => (
        <Link
            key={index}
            to={item.href}
        >
            {item.title}
        </Link>
    ))

    const handleProjectDelete = (id: Identifier, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name} project?`)) {
            projectBroker.destroy(id).then(() => {
                projectBroker.invalidateProjects(client_id as Identifier).then()
            })
        }
    }

    const handleProjectStatusChange = (id: Identifier, status: boolean) => {
        api.project_set_status(id, status).then(() => {
            projectBroker.invalidateProjects(client_id as Identifier).then()
            projectBroker.invalidateProject(client_id as Identifier, id).then(() => {})
        })
    }

    return (
        <>
            <Title>Projects for {clientRecord.name}</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Enabled</Table.Th>
                        <Table.Th>View Tasks</Table.Th>
                        <Table.Th>Edit</Table.Th>
                        <Table.Th>Delete</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allProjects.map((project: Project) => (
                        <Table.Tr key={project.id}>
                            <Table.Td>{project.name}</Table.Td>
                            <Table.Td>
                                <Checkbox
                                    checked={project ? project.is_active : false}
                                    onChange={(event) =>
                                        handleProjectStatusChange(project.id, event.currentTarget.checked)
                                    }
                                />
                            </Table.Td>
                            <Table.Td>
                                <Link to={`${project.id}/tasks`}>Tasks {project.tasks_count}</Link>
                            </Table.Td>
                            <Table.Td>
                                <Button>Edit</Button>
                            </Table.Td>
                            <Table.Td>
                                <Button onClick={() => handleProjectDelete(project.id, project.name)}>
                                    Delete
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Outlet />
        </>
    )
}
