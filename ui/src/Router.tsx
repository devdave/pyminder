import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import { Page404 } from '@src/404.page'
import { ReportsPage } from '@src/pages/Reports.page'
import { useHotkeys } from '@mantine/hooks'
import { useMantineColorScheme } from '@mantine/core'
import { ManagePage } from '@src/pages/manage/Manage.page'
import { ProjectsPage } from '@src/pages/manage/Projects.page'
import { TasksPage } from '@src/pages/manage/Tasks.page'
import { EventsPage } from '@src/pages/manage/Events.page'
import { MainPage as EntriesMainPage } from '@src/pages/manage/entries/Main.page'
import { ListPage as EntriesListPage } from '@src/pages/manage/entries/List.page'
import { CreatePage as CreateEntryPage } from '@src/pages/manage/entries/Create.page'
import { UpdatePage as UpdateEntryPage } from '@src/pages/manage/entries/Update.page'
import { HomePage } from './pages/Home.page'

const AppRoutes = () => {
    const { toggleColorScheme } = useMantineColorScheme()

    useHotkeys([['ctrl+j', () => toggleColorScheme()]])
    return (
        <Routes>
            <Route
                path='/'
                element={<HomePage />}
            />
            <Route
                path='/reports'
                element={<ReportsPage />}
            />
            <Route
                path='/manage'
                element={<ManagePage />}
            />
            <Route
                path='/manage/client/:client_id/projects'
                element={<ProjectsPage />}
            />
            <Route
                path='/manage/client/:client_id/projects/:project_id/tasks'
                element={<TasksPage />}
            />
            <Route
                path='/manage/client/:client_id/projects/:project_id/tasks/:task_id/events'
                element={<EventsPage />}
            />
            <Route
                path='/manage/client/:client_id/projects/:project_id/tasks/:task_id/events/:event_id/entries'
                element={<EntriesMainPage />}
            >
                <Route
                    path=''
                    element={<EntriesListPage />}
                />
                <Route
                    path='create'
                    element={<CreateEntryPage />}
                />
                <Route
                    path='update/:entry_id'
                    element={<UpdateEntryPage />}
                />
            </Route>
            <Route
                path='*'
                element={<Page404 />}
            />
        </Routes>
    )
}

const router = createBrowserRouter([
    {
        path: '*',
        element: <AppRoutes />,
        errorElement: <Page404 />
    },
    {
        path: '/index.html/*',
        element: <AppRoutes />,
        errorElement: <Page404 />
    }
])

export function Router() {
    return <RouterProvider router={router} />
}
