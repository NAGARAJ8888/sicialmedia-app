import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    value: null,
    loading: false,
    error: null,
    discoverResults: {
        users: [],
        posts: [],
        hashtags: []
    },
    discoverLoading: false,
    discoverError: null,
};

export const fetchUserData = createAsyncThunk('user/fetchUser', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/user/data', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        // API returns user object directly, not wrapped in { success, user }
        if (data && data._id) {
            return data;
        }
        
        // Handle case where API returns { success, user } format
        if (data.success && data.user) {
            return data.user;
        }
        
        return rejectWithValue(data.message || 'Invalid user data format');
    } catch (error) {
        console.error('Error fetching user data:', error);
        return rejectWithValue(
            error.response?.data?.message || 
            error.message || 
            'Failed to fetch user data'
        );
    }
});

export const discoverSearch = createAsyncThunk('user/discoverSearch', async ({ token, searchQuery }, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/api/user/discover', 
            { input: searchQuery },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        if (data.success) {
            return {
                users: data.users || [],
                posts: data.posts || [],
                hashtags: data.hashtags || []
            };
        }
        
        return rejectWithValue(data.message || 'Failed to discover');
    } catch (error) {
        console.error('Error in discover search:', error);
        return rejectWithValue(
            error.response?.data?.message || 
            error.message || 
            'Failed to search'
        );
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.value = action.payload;
        },
        clearUser: (state) => {
            state.value = null;
            state.loading = false;
            state.error = null;
        },
        optimisticUpdate: (state, action) => {
            if (state.value) {
                state.value = { ...state.value, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || 'Failed to fetch user';
                state.value = null;
            })
            .addCase(discoverSearch.pending, (state) => {
                state.discoverLoading = true;
                state.discoverError = null;
            })
            .addCase(discoverSearch.fulfilled, (state, action) => {
                state.discoverLoading = false;
                state.discoverResults = action.payload;
            })
            .addCase(discoverSearch.rejected, (state, action) => {
                state.discoverLoading = false;
                state.discoverError = action.payload || action.error?.message || 'Failed to search';
                state.discoverResults = { users: [], posts: [], hashtags: [] };
            })
    }
});

export const { setUser, clearUser, optimisticUpdate } = userSlice.actions;
export default userSlice.reducer;