import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { X, Menu } from 'lucide-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const user = useSelector((state) => state.user.value)
    const userLoading = useSelector((state) => state.user.loading)
    const userError = useSelector((state) => state.user.error)

    // Show loading only when actively loading
    if (userLoading) {
        return <Loading/>
    }

    // Show error if there's an error and no user
    if (userError && !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading user data</p>
                    <p className="text-sm text-gray-600">{userError}</p>
                </div>
            </div>
        )
    }

    // Show loading if no user yet (but not actively loading)
    if (!user) {
        return <Loading/>
    }

    return (
        <div className='flex w-full h-screen'>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className='flex-1 bg-slate-50'>
                <Outlet/>
            </div>
            {
                sidebarOpen ? 
                <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)}/>
                :
                <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)}/>
            }
        </div>
    )
}

export default Layout;
