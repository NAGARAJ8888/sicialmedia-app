import React from 'react'
import reactLogo from '../assets/react.svg'
import { SignIn } from '@clerk/clerk-react'

const Login = () => {
    return (
        <div 
            className='min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50' 
            style={{ 
                minHeight: '100vh', 
                width: '100%'
            }}
        >
            {/* Left Section - Logo and Content */}
            <div className='flex-1 flex flex-col p-8 md:p-12 lg:p-16'>
                {/* Logo at top left */}
                <div className='mb-8 md:mb-12'>
                    <img 
                        src={reactLogo} 
                        alt='Logo' 
                        className='h-10 w-10 md:h-12 md:w-12'
                    />
                </div>

                {/* Content at mid left */}
                <div className='flex-1 flex items-center'>
                    <div className='max-w-lg'>
                        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
                            Share your life in photos
                        </h1>
                        <p className='text-lg md:text-xl text-gray-700 mb-4 leading-relaxed'>
                            Capture and share the moments that matter to you.
                        </p>
                        <p className='text-base md:text-lg text-gray-600 leading-relaxed'>
                            See what your friends are up to and stay connected.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section - Space for Clerk Login */}
            <div className='flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white md:bg-transparent'>
                <SignIn />
            </div>
        </div>
    )
}

export default Login;