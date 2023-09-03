import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";


const initialState = {
  isLoading: false,
  error: null,
  commentsById: {},
  commentsByPost: {},
  currentPageByPost: {},
  totalCommentsByPost: {},
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    createCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    deleteCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("payload in del comment", action.payload);
    },
    getCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, comments, count, page } = action.payload;
      comments.forEach(
        (comment) => (state.commentsById[comment._id] = comment)
      );
      state.commentsByPost[postId] = comments
        .map((comment) => comment._id)
        .reverse();
      state.currentPageByPost[postId] = page;
      state.totalCommentsByPost[postId] = count;
    },
    sendCommentReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, reactions } = action.payload;
      state.commentsById[commentId].reactions = reactions;
    },
  },
});
export default slice.reducer;
export const createComment =
  ({ postId, content }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post("/comments", {
        content,
        postId,
      });
      dispatch(slice.actions.createCommentSuccess(response.data.data));

      dispatch(getComments({ postId }));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
    }
  };

export const getComments =
  ({ postId, page = 1, limit = 5 }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = {
        page: page,
        limit: limit,
      };
      console.log(`postID in get Comment is`, postId);
      const response = await apiService.get(`/posts/${postId}/comments`, {
        params,
      });
      console.log(`response in getComment is`, response);
      dispatch(
        slice.actions.getCommentSuccess({ ...response.data.data, postId, page })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
    }
  };

export const sendCommentReaction =
  ({ commentId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Comment",
        targetId: commentId,
        emoji,
      });
      dispatch(
        slice.actions.sendCommentReactionSuccess({
          commentId,
          reactions: response.data.data,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
    }
  };
export const deleteComment = (comment) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/comments/${comment._id}`);
    dispatch(slice.actions.deleteCommentSuccess(response.data.data));
    dispatch(getComments({ postId:comment.post }));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};
