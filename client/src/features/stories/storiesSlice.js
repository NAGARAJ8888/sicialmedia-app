import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    stories: [],
    loading: false,
    error: null,
};

export const fetchStories = createAsyncThunk('stories/fetchStories', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/story/get', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (data.success && data.stories) {
            return data.stories;
        }
        
        return rejectWithValue(data.message || 'Failed to fetch stories');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch stories');
    }
});

const storiesSlice = createSlice({
    name: 'stories',
    initialState,
    reducers: {
        setStories: (state, action) => {
            state.stories = action.payload;
        },
        addStory: (state, action) => {
            state.stories.unshift(action.payload);
        },
        updateStory: (state, action) => {
            const index = state.stories.findIndex(story => story._id === action.payload._id);
            if (index !== -1) {
                state.stories[index] = { ...state.stories[index], ...action.payload };
            }
        },
        deleteStory: (state, action) => {
            state.stories = state.stories.filter(story => story._id !== action.payload);
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
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setStories, addStory, updateStory, deleteStory, setLoading, setError } = storiesSlice.actions;
export default storiesSlice.reducer;
