import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import { Page404 } from '@src/404.page'
import { ReportsPage } from '@src/pages/Reports.page'
import { useHotkeys } from '@mantine/hooks'
import { useMantineColorScheme } from '@mantine/core'
import { ManagePage } from '@src/pages/manage/Manage.page'
import { ProjectsPage } from '@src/pages/manage/Projects.page'
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
            >
                <Route
                    path='client/:client_id/projects'
                    element={<ProjectsPage />}
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
