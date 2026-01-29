import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
    loading: false,
    error: null,
};

// Fetch all connections, followers, and following
export const fetchUserConnections = createAsyncThunk(
    'connections/fetchUserConnections',
    async (token, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/user/connections', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return {
                    connections: data.connections || [],
                    followers: data.followers || [],
                    following: data.following || [],
                    pendingConnections: data.pendingConnections || [],
                };
            }

            return rejectWithValue(data.message || 'Failed to fetch connections');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch connections');
        }
    }
);

// Discover users by search query
export const discoverUsers = createAsyncThunk(
    'connections/discoverUsers',
    async ({ token, input }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/discover', { input }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return data.users || [];
            }

            return rejectWithValue(data.message || 'Failed to discover users');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to discover users');
        }
    }
);

// Follow a user
export const followUser = createAsyncThunk(
    'connections/followUser',
    async ({ token, followId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/follow', { followId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return { userId: followId, message: data.message };
            }

            return rejectWithValue(data.message || 'Failed to follow user');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
        }
    }
);

// Unfollow a user
export const unfollowUser = createAsyncThunk(
    'connections/unfollowUser',
    async ({ token, unfollowId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/unfollow', { unfollowId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return { userId: unfollowId, message: data.message };
            }

            return rejectWithValue(data.message || 'Failed to unfollow user');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
        }
    }
);

// Send connection request
export const sendConnectionRequest = createAsyncThunk(
    'connections/sendConnectionRequest',
    async ({ token, id }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/connect', { id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return { userId: id, message: data.message };
            }

            return rejectWithValue(data.message || 'Failed to send connection request');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send connection request');
        }
    }
);

// Accept connection request
export const acceptConnectionRequest = createAsyncThunk(
    'connections/acceptConnectionRequest',
    async ({ token, userId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/accept', { Id: userId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return { userId, message: data.message };
            }

            return rejectWithValue(data.message || 'Failed to accept connection request');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept connection request');
        }
    }
);

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        setConnections: (state, action) => {
            state.connections = action.payload;
        },
        setPendingConnections: (state, action) => {
            state.pendingConnections = action.payload;
        },
        setFollowers: (state, action) => {
            state.followers = action.payload;
        },
        setFollowing: (state, action) => {
            state.following = action.payload;
        },
        addConnection: (state, action) => {
            state.connections.push(action.payload);
        },
        removeConnection: (state, action) => {
            state.connections = state.connections.filter(conn => conn._id !== action.payload);
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
            // Fetch connections
            .addCase(fetchUserConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.connections;
                state.followers = action.payload.followers;
                state.following = action.payload.following;
                state.pendingConnections = action.payload.pendingConnections;
            })
            .addCase(fetchUserConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Follow user
            .addCase(followUser.fulfilled, (state, action) => {
                if (!state.following.some(f => f._id === action.payload.userId)) {
                    state.following.push({ _id: action.payload.userId });
                }
            })
            // Unfollow user
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.following = state.following.filter(f => f._id !== action.payload.userId);
            })
            // Send connection request
            .addCase(sendConnectionRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendConnectionRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendConnectionRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Accept connection request
            .addCase(acceptConnectionRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingConnections = state.pendingConnections.filter(
                    conn => conn._id !== action.payload.userId
                );
                if (!state.connections.some(c => c._id === action.payload.userId)) {
                    state.connections.push({ _id: action.payload.userId });
                }
            })
            .addCase(acceptConnectionRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    setConnections, 
    setPendingConnections, 
    setFollowers, 
    setFollowing, 
    addConnection, 
    removeConnection,
    setLoading, 
    setError 
} = connectionsSlice.actions;
export default connectionsSlice.reducer;