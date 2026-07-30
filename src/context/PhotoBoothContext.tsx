/* ============================================
   LumiStrip — Global Photo Booth State
   Tracks the entire user flow from template selection
   through capture, editing, and download.
   ============================================ */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  CapturedPhoto,
  CaptureSession,
  CaptureStatus,
  EditorState,
  FilterPreset,
  PlacedSticker,
  TextOverlay,
  Template,
  ExportConfig,
  PhotoArea,
} from '../types';
import { DEFAULT_TEMPLATE_ID } from '../constants/templates';

/* ── State Shape ── */
interface PhotoBoothState {
  // Navigation
  currentPage: string;

  // Template selection
  selectedTemplateId: string;
  template: Template | null;

  // Capture
  session: CaptureSession | null;
  captureStatus: CaptureStatus;
  capturedPhotos: CapturedPhoto[];

  // Editor
  editor: EditorState;

  // Export
  exportConfig: ExportConfig;

  // UI
  isMusicOn: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
}

/* ── Initial State ── */
const initialEditor: EditorState = {
  photos: [],
  activePhotoIndex: 0,
  templateId: DEFAULT_TEMPLATE_ID,
  filter: 'none',
  stickers: [],
  texts: [],
  caption: '',
  showDateStamp: true,
  stripSize: 'medium',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  customFrameUrl: null,
  customFramePhotoArea: null,
  extraBottomSpace: 0,
};

const initialState: PhotoBoothState = {
  currentPage: 'landing',
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  template: null,
  session: null,
  captureStatus: 'idle',
  capturedPhotos: [],
  editor: initialEditor,
  exportConfig: {
    format: 'png',
    quality: 'hd',
    includeWatermark: false,
  },
  isMusicOn: false,
  toast: null,
};

/* ── Actions ── */
type Action =
  | { type: 'SET_PAGE'; payload: string }
  | { type: 'SELECT_TEMPLATE'; payload: string }
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'SET_CAPTURE_STATUS'; payload: CaptureStatus }
  | { type: 'ADD_PHOTO'; payload: CapturedPhoto }
  | { type: 'CLEAR_PHOTOS' }
  | { type: 'SET_SESSION'; payload: CaptureSession | null }
  | { type: 'SET_FILTER'; payload: FilterPreset }
  | { type: 'ADD_STICKER'; payload: PlacedSticker }
  | { type: 'UPDATE_STICKER'; payload: { id: string; updates: Partial<PlacedSticker> } }
  | { type: 'REMOVE_STICKER'; payload: string }
  | { type: 'ADD_TEXT'; payload: TextOverlay }
  | { type: 'UPDATE_TEXT'; payload: { id: string; updates: Partial<TextOverlay> } }
  | { type: 'REMOVE_TEXT'; payload: string }
  | { type: 'SET_CAPTION'; payload: string }
  | { type: 'TOGGLE_DATE_STAMP' }
  | { type: 'SET_STRIP_SIZE'; payload: 'small' | 'medium' | 'large' }
  | { type: 'SET_BRIGHTNESS'; payload: number }
  | { type: 'SET_CONTRAST'; payload: number }
  | { type: 'SET_SATURATION'; payload: number }
  | { type: 'SET_CUSTOM_FRAME'; payload: { url: string | null; photoArea?: PhotoArea | null } }
  | { type: 'SET_EXTRA_BOTTOM_SPACE'; payload: number }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' | 'warning' } }
  | { type: 'HIDE_TOAST' }
  | { type: 'RESET' };

function reducer(state: PhotoBoothState, action: Action): PhotoBoothState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        selectedTemplateId: action.payload,
        editor: { ...state.editor, templateId: action.payload },
      };

    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };

    case 'SET_CAPTURE_STATUS':
      return { ...state, captureStatus: action.payload };

    case 'ADD_PHOTO':
      return {
        ...state,
        capturedPhotos: [...state.capturedPhotos, action.payload],
        editor: { ...state.editor, photos: [...state.editor.photos, action.payload] },
      };

    case 'CLEAR_PHOTOS':
      return { ...state, capturedPhotos: [], editor: { ...state.editor, photos: [] } };

    case 'SET_SESSION':
      return { ...state, session: action.payload };

    case 'SET_FILTER':
      return { ...state, editor: { ...state.editor, filter: action.payload } };

    case 'ADD_STICKER':
      return {
        ...state,
        editor: {
          ...state.editor,
          stickers: [...state.editor.stickers, action.payload],
        },
      };

    case 'UPDATE_STICKER':
      return {
        ...state,
        editor: {
          ...state.editor,
          stickers: state.editor.stickers.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
          ),
        },
      };

    case 'REMOVE_STICKER':
      return {
        ...state,
        editor: {
          ...state.editor,
          stickers: state.editor.stickers.filter((s) => s.id !== action.payload),
        },
      };

    case 'ADD_TEXT':
      return {
        ...state,
        editor: { ...state.editor, texts: [...state.editor.texts, action.payload] },
      };

    case 'UPDATE_TEXT':
      return {
        ...state,
        editor: {
          ...state.editor,
          texts: state.editor.texts.map((t) =>
            t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
          ),
        },
      };

    case 'REMOVE_TEXT':
      return {
        ...state,
        editor: {
          ...state.editor,
          texts: state.editor.texts.filter((t) => t.id !== action.payload),
        },
      };

    case 'SET_CAPTION':
      return { ...state, editor: { ...state.editor, caption: action.payload } };

    case 'TOGGLE_DATE_STAMP':
      return {
        ...state,
        editor: { ...state.editor, showDateStamp: !state.editor.showDateStamp },
      };

    case 'SET_STRIP_SIZE':
      return { ...state, editor: { ...state.editor, stripSize: action.payload } };

    case 'SET_BRIGHTNESS':
      return { ...state, editor: { ...state.editor, brightness: action.payload } };

    case 'SET_CONTRAST':
      return { ...state, editor: { ...state.editor, contrast: action.payload } };

    case 'SET_SATURATION':
      return { ...state, editor: { ...state.editor, saturation: action.payload } };

    case 'SET_CUSTOM_FRAME':
      return {
        ...state,
        editor: {
          ...state.editor,
          customFrameUrl: action.payload.url,
          customFramePhotoArea: action.payload.photoArea ?? (action.payload.url ? state.editor.customFramePhotoArea : null),
        },
      };

    case 'SET_EXTRA_BOTTOM_SPACE':
      return { ...state, editor: { ...state.editor, extraBottomSpace: action.payload } };

    case 'TOGGLE_MUSIC':
      return { ...state, isMusicOn: !state.isMusicOn };

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'RESET':
      return { ...initialState, selectedTemplateId: state.selectedTemplateId };

    default:
      return state;
  }
}

/* ── Context ── */
interface PhotoBoothContextType {
  state: PhotoBoothState;
  dispatch: React.Dispatch<Action>;
  // Convenience actions
  setPage: (page: string) => void;
  selectTemplate: (id: string) => void;
  addPhoto: (photo: CapturedPhoto) => void;
  clearPhotos: () => void;
  setFilter: (filter: FilterPreset) => void;
  addSticker: (sticker: PlacedSticker) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  addText: (text: TextOverlay) => void;
  updateText: (id: string, updates: Partial<TextOverlay>) => void;
  removeText: (id: string) => void;
  setCaption: (caption: string) => void;
  toggleDateStamp: () => void;
  setStripSize: (size: 'small' | 'medium' | 'large') => void;
  resetSession: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const PhotoBoothCtx = createContext<PhotoBoothContextType | null>(null);

export function PhotoBoothProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setPage = useCallback((page: string) => dispatch({ type: 'SET_PAGE', payload: page }), []);
  const selectTemplate = useCallback((id: string) => dispatch({ type: 'SELECT_TEMPLATE', payload: id }), []);
  const addPhoto = useCallback((photo: CapturedPhoto) => dispatch({ type: 'ADD_PHOTO', payload: photo }), []);
  const clearPhotos = useCallback(() => dispatch({ type: 'CLEAR_PHOTOS' }), []);
  const setFilter = useCallback((filter: FilterPreset) => dispatch({ type: 'SET_FILTER', payload: filter }), []);
  const addSticker = useCallback((sticker: PlacedSticker) => dispatch({ type: 'ADD_STICKER', payload: sticker }), []);
  const updateSticker = useCallback(
    (id: string, updates: Partial<PlacedSticker>) => dispatch({ type: 'UPDATE_STICKER', payload: { id, updates } }),
    []
  );
  const removeSticker = useCallback((id: string) => dispatch({ type: 'REMOVE_STICKER', payload: id }), []);
  const addText = useCallback((text: TextOverlay) => dispatch({ type: 'ADD_TEXT', payload: text }), []);
  const updateText = useCallback(
    (id: string, updates: Partial<TextOverlay>) => dispatch({ type: 'UPDATE_TEXT', payload: { id, updates } }),
    []
  );
  const removeText = useCallback((id: string) => dispatch({ type: 'REMOVE_TEXT', payload: id }), []);
  const setCaption = useCallback((caption: string) => dispatch({ type: 'SET_CAPTION', payload: caption }), []);
  const toggleDateStamp = useCallback(() => dispatch({ type: 'TOGGLE_DATE_STAMP' }), []);
  const setStripSize = useCallback((size: 'small' | 'medium' | 'large') => dispatch({ type: 'SET_STRIP_SIZE', payload: size }), []);
  const resetSession = useCallback(() => dispatch({ type: 'RESET' }), []);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);

  return (
    <PhotoBoothCtx.Provider
      value={{
        state,
        dispatch,
        setPage,
        selectTemplate,
        addPhoto,
        clearPhotos,
        setFilter,
        addSticker,
        updateSticker,
        removeSticker,
        addText,
        updateText,
        removeText,
        setCaption,
        toggleDateStamp,
        setStripSize,
        resetSession,
        showToast,
      }}
    >
      {children}
    </PhotoBoothCtx.Provider>
  );
}

export function usePhotoBooth() {
  const ctx = useContext(PhotoBoothCtx);
  if (!ctx) throw new Error('usePhotoBooth must be used within PhotoBoothProvider');
  return ctx;
}

