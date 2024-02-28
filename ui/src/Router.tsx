import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import { Page404 } from '@src/404.page'
import { ReportsPage } from '@src/pages/Reports.page'
import { HomePage } from './pages/Home.page'

const AppRoutes = () => (
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
            path='*'
            element={<Page404 />}
        />
    </Routes>
)

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
