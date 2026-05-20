import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { AIDialogue, AIMessage, AIMode, StageType } from '../../types';
import { useAIStore } from '../../stores/aiStore';
import { ModeSwitcher } from './ModeSwitcher';
import { AIMessageBubble } from './AIMessage';

interface AIChatPanelProps {
  stageId: string;
  stageType: StageType;
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  stageId,
  stageType,
  isOpen,
  onClose
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentDialogue, 
    currentMode, 
    isTyping,
    createDialogue,
    sendMessage,
    setCurrentMode
  } = useAIStore();
  
  useEffect(() => {
    if (isOpen && !currentDialogue) {
      createDialogue(stageId, currentMode, stageType);
    }
  }, [isOpen, stageId, currentMode, currentDialogue, createDialogue]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentDialogue?.messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    await sendMessage(input, stageType);
    setInput('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-gray-800/95 backdrop-blur border-l border-gray-700/50 shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">AI协作助手</h3>
              <p className="text-xs text-gray-500">全程陪伴您的需求旅程</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <ModeSwitcher 
          currentMode={currentMode}
          onModeChange={setCurrentMode}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentDialogue?.messages.map((message) => (
          <AIMessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-gray-900" />
            </div>
            <div className="bg-gray-700/50 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-gray-400">思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的回答..."
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
