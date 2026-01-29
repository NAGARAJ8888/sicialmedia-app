import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuItemsData, assets } from '../assets/assets'
import { X, Plus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/clerk-react'
import { useSelector } from 'react-redux'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation()
    const user = useSelector((state) => state.user.value)
    const {signOut} = useClerk()


    const isActive = (path) => {
        if (path === '/app') {
            return location.pathname === '/app' || location.pathname === '/'
        }
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    return (
        <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-white border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col h-screen
                `}
            >
                {/* Header with Logo and Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <Link to="/app" className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Vibely
                        </h1>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItemsData.map((item) => {
                            const Icon = item.Icon
                            const path = item.to === '/' ? '/app' : `/app${item.to}`
                            const active = isActive(path)
                            const isCreatePost = item.label === 'Create Post'
                            
                            return (
                                <li key={item.to}>
                                    <Link
                                        to={path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            flex items-center space-x-3 px-4 py-3 rounded-lg
                                            transition-colors duration-200
                                            ${isCreatePost
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white font-medium mt-5'
                                                : active 
                                                ? 'bg-purple-50 text-purple-600 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <Icon className={`h-5 w-5 ${isCreatePost ? 'text-white' : active ? 'text-purple-600' : 'text-gray-500'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* User Profile Section */}
                <div className="border-t border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/app/profile"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                        >
                            <UserButton/>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.full_name || user?.username || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    @{user?.username || 'user'}
                                </p>
                            </div>
                        </Link>
                        
                        <button
                            onClick={() => signOut()}
                            className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
