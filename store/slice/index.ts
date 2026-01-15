import { createSlice } from "@reduxjs/toolkit"

type AppState = Record<string, never>

const initialState: AppState = {}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {},
})

export default appSlice.reducer
