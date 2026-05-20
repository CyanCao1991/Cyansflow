import { create } from 'zustand';
import { AIDialogue, AIMessage, AIMode, StageType } from '../types';
import { dialogueDB } from '../services/db';
import { generateAIResponse, generateInitialMessage } from '../services/aiService';
import { nanoid } from 'nanoid';

interface AIState {
  dialogues: AIDialogue[];
  currentDialogue: AIDialogue | null;
  currentMode: AIMode;
  loading: boolean;
  isTyping: boolean;
  
  loadDialogues: (stageId: string) => Promise<void>;
  createDialogue: (stageId: string, mode: AIMode, stageType: StageType) => Promise<AIDialogue>;
  setCurrentDialogue: (dialogue: AIDialogue | null) => void;
  setCurrentMode: (mode: AIMode) => void;
  sendMessage: (content: string, stageType: StageType) => Promise<void>;
  getDialogueByStage: (stageId: string) => AIDialogue | undefined;
}

export const useAIStore = create<AIState>((set, get) => ({
  dialogues: [],
  currentDialogue: null,
  currentMode: 'questioning',
  loading: false,
  isTyping: false,
  
  loadDialogues: async (stageId: string) => {
    set({ loading: true });
    try {
      const dialogues = await dialogueDB.getByStage(stageId);
      set({ dialogues, loading: false });
      
      if (dialogues.length > 0) {
        set({ currentDialogue: dialogues[dialogues.length - 1] });
      }
    } catch (error) {
      console.error('Failed to load dialogues:', error);
      set({ loading: false });
    }
  },
  
  createDialogue: async (stageId: string, mode: AIMode, stageType: StageType) => {
    const initialMessage = generateInitialMessage(stageType, mode);
    
    const dialogue: AIDialogue = {
      id: nanoid(),
      stageId,
      mode,
      messages: [initialMessage],
      currentRound: 1,
      createdAt: Date.now()
    };
    
    await dialogueDB.create(dialogue);
    
    set(state => ({
      dialogues: [...state.dialogues, dialogue],
      currentDialogue: dialogue
    }));
    
    return dialogue;
  },
  
  setCurrentDialogue: (dialogue: AIDialogue | null) => {
    set({ currentDialogue: dialogue });
  },
  
  setCurrentMode: (mode: AIMode) => {
    set({ currentMode: mode });
  },
  
  sendMessage: async (content: string, stageType: StageType) => {
    const { currentDialogue, currentMode } = get();
    
    if (!currentDialogue) return;
    
    const userMessage: AIMessage = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...currentDialogue.messages, userMessage];
    
    set(state => ({
      currentDialogue: state.currentDialogue 
        ? { ...state.currentDialogue, messages: updatedMessages }
        : null,
      dialogues: state.dialogues.map(d => 
        d.id === currentDialogue.id ? { ...d, messages: updatedMessages } : d
      )
    }));
    
    await dialogueDB.update(currentDialogue.id, { messages: updatedMessages });
    
    set({ isTyping: true });
    
    try {
      const aiResponse = await generateAIResponse(currentMode, stageType, updatedMessages, content);
      
      const finalMessages = [...updatedMessages, aiResponse];
      
      set(state => ({
        currentDialogue: state.currentDialogue 
          ? { 
              ...state.currentDialogue, 
              messages: finalMessages,
              currentRound: state.currentDialogue.currentRound + 1
            }
          : null,
        dialogues: state.dialogues.map(d => 
          d.id === currentDialogue.id 
            ? { 
                ...d, 
                messages: finalMessages,
                currentRound: d.currentRound + 1
              } 
            : d
        ),
        isTyping: false
      }));
      
      await dialogueDB.update(currentDialogue.id, { 
        messages: finalMessages,
        currentRound: currentDialogue.currentRound + 1
      });
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      set({ isTyping: false });
    }
  },
  
  getDialogueByStage: (stageId: string) => {
    return get().dialogues.find(d => d.stageId === stageId);
  }
}));
