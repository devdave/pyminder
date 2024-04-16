import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import { Page404 } from '@src/404.page'
import { ReportsPage } from '@src/pages/Reports.page'
import { useHotkeys } from '@mantine/hooks'
import { useMantineColorScheme } from '@mantine/core'

import { ManagePage } from '@src/pages/manage/Manage.page'

import { ProjectsPage } from '@src/pages/manage/projects/Projects.page'
import { ListPage as ProjectListPage } from '@src/pages/manage/projects/List.page'

import { TasksMainPage } from '@src/pages/manage/tasks/Main.page'
import { TasksListPage } from '@src/pages/manage/tasks/List.page'

import { MainPage as EventsMainPage } from '@src/pages/manage/events/Main.page'
import { ListPage as EventsListPage } from '@src/pages/manage/events/List.page'
import { CreatePage as EventsCreatePage } from '@src/pages/manage/events/Create.page'
import { UpdatePage as EventsUpdatePage } from '@src/pages/manage/events/Update.page'

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
            >
                <Route
                    path=''
                    element={<ProjectListPage />}
                />
            </Route>
            <Route
                path='/manage/client/:client_id/projects/:project_id/tasks'
                element={<TasksMainPage />}
            >
                <Route
                    path=''
                    element={<TasksListPage />}
                />
            </Route>

            <Route
                path='/manage/client/:client_id/projects/:project_id/tasks/:task_id/events'
                element={<EventsMainPage />}
            >
                <Route
                    path=''
                    element={<EventsListPage />}
                />
                <Route
                    path='create'
                    element={<EventsCreatePage />}
                />
                <Route
                    path='update/:event_id'
                    element={<EventsUpdatePage />}
                />
            </Route>
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
