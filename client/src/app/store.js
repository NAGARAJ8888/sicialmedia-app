import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import messagesReducer from '../features/messages/messagesSlice';
import connectionsReducer from '../features/connections/connectionsSlice';
import postsReducer from '../features/posts/postsSlice';
import storiesReducer from '../features/stories/storiesSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        messages: messagesReducer,
        connections: connectionsReducer,
        posts: postsReducer,
        stories: storiesReducer,
    },
});