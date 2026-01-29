import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Chatbox from './pages/Chatbox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import { useUser, useAuth } from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUserData } from './features/user/userSlice'
import { fetchFeedPosts } from './features/posts/postsSlice'
import { fetchUserConnections } from './features/connections/connectionsSlice'

function App() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const dispatch = useDispatch()

  useEffect(()=>{
    const fetchData = async () => {
      if (!user) return
      
      try {
        const token = await getToken()
        if (!token) {
          console.error('No token available')
          return
        }
        
        console.log('Token for Postman:', token)
        console.log('Fetching user data with token...')
        dispatch(fetchUserData(token))
        dispatch(fetchFeedPosts(token))
        dispatch(fetchUserConnections(token))
      } catch (error) {
        console.error('Error in fetchData:', error)
      }
    }

    fetchData()
  },[user, getToken, dispatch])

  return (
    <>
    <Toaster/>
    <Routes>
      <Route path='/' element={ !user ? <Login/> : <Navigate to="/app" replace />} />
      <Route path='/app' element={<Layout/>}>
        <Route index element={<Feed/>} />
        <Route path='messages' element={<Messages />} />
        <Route path='messages/:userId' element={<Chatbox/>} />
        <Route path='connections' element={<Connections/>} />
        <Route path='discover' element={<Discover/>} />
        <Route path='profile' element={<Profile/>} />
        <Route path='profile/:profileId' element={<Profile/>} />
        <Route path='create-post' element={<CreatePost/>} />
      </Route>
    </Routes>
    </>
  )
}

export default App
