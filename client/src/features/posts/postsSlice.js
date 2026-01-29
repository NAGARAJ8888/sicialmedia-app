import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    posts: [],
    loading: false,
    error: null,
};

export const fetchFeedPosts = createAsyncThunk('posts/fetchFeedPosts', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/post/feed', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (data.success && data.posts) {
            return data.posts;
        }
        
        return rejectWithValue(data.message || 'Failed to fetch posts');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
});

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        addPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        updatePost: (state, action) => {
            const index = state.posts.findIndex(post => post._id === action.payload._id);
            if (index !== -1) {
                state.posts[index] = { ...state.posts[index], ...action.payload };
            }
        },
        deletePost: (state, action) => {
            state.posts = state.posts.filter(post => post._id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeedPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
            })
            .addCase(fetchFeedPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setPosts, addPost, updatePost, deletePost, setLoading, setError } = postsSlice.actions;
export default postsSlice.reducer;
