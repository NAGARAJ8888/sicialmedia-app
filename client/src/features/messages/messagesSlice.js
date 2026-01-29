import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =======================
   Async Thunks
======================= */

// Get chat messages between two users
export const fetchChatMessages = createAsyncThunk(
  "messages/fetchChatMessages",
  async ({ to_user_id }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/message/chat", { to_user_id });
      return res.data.messages;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Send message (text or image)
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/message/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get recent conversations
export const fetchRecentMessages = createAsyncThunk(
  "messages/fetchRecentMessages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/message/recent");
      return res.data.conversations;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Mark messages as seen
export const markMessagesAsSeen = createAsyncThunk(
  "messages/markMessagesAsSeen",
  async ({ from_user_id }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/message/mark-seen", { from_user_id });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* =======================
   Slice
======================= */

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    recentChats: [],
    loading: false,
    error: null,
  },
  reducers: {
    addMessageRealtime: (state, action) => {
      // Used for SSE / socket incoming message
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder

      /* Fetch chat messages */
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Send message */
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* Recent conversations */
      .addCase(fetchRecentMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.recentChats = action.payload;
      })
      .addCase(fetchRecentMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Mark messages as seen */
      .addCase(markMessagesAsSeen.pending, (state) => {
        state.error = null;
      })
      .addCase(markMessagesAsSeen.fulfilled, (state, action) => {
        // Update the seen status of messages in the current messages list
        state.messages = state.messages.map((msg) => ({
          ...msg,
          seen: true,
        }));
      })
      .addCase(markMessagesAsSeen.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addMessageRealtime, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
