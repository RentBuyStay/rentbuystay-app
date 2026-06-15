import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

type TypingState = Record<string, Record<string, boolean>>; // conversationId -> userId -> boolean

interface ChatState {
  typing: TypingState;
}

const initialState: ChatState = {
  typing: {},
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typing[conversationId]) {
        state.typing[conversationId] = {};
      }
      state.typing[conversationId][userId] = isTyping;
    },
  },
});

export const { setTyping } = chatSlice.actions;

export const selectTypingStatus = (conversationId: string) => (state: RootState) =>
  state.chat.typing[conversationId] || {};

export default chatSlice.reducer;
