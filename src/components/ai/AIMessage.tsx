import React from 'react';
import { AIMessage } from '../../types';
import { Badge } from '../common/Badge';
import { Sparkles, User } from 'lucide-react';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAI = message.role === 'ai';
  
  const getTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      question: '追问',
      answer: '回答',
      suggestion: '建议',
      validation: '验证'
    };
    return type ? labels[type] || '' : '';
  };
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-purple-500/20 text-purple-400' 
            : 'bg-gradient-to-br from-primary to-secondary text-gray-900'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div 
          className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-primary/20 text-gray-100' 
              : 'bg-gray-700/50 text-gray-100'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {isAI && message.type && (
          <div className="mt-1 flex items-center space-x-2">
            <Badge variant="primary" size="sm">
              {getTypeLabel(message.type)}
            </Badge>
            {message.intentTags && message.intentTags.length > 0 && (
              <>
                {message.intentTags.map(tag => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </>
            )}
          </div>
        )}
        
        <span className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
