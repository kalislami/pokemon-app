import { createSlice } from "@reduxjs/toolkit";
import { AppState } from './store';

export interface PokeState {
    selectedId: number | null,
    url: string,
}

const initialState: PokeState = {
    selectedId: null,
    url: ''
}

export const PokeSlice = createSlice({
    name: "poke",
    initialState,
    reducers: {
        setPokeId(state, action) {
            state.selectedId = action.payload
        },
        setPokeUrl(state, action) {
            state.url = action.payload
        }
    }
})

export const { setPokeId, setPokeUrl } = PokeSlice.actions;
export const selectPokeId = (state: AppState) => state.poke.selectedId
export const selectPokeUrl = (state: AppState) => state.poke.url
export default PokeSlice.reducer