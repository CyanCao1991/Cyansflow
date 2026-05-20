export const theme = {
  colors: {
    primary: '#00d4aa',
    secondary: '#6366f1',
    warning: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444',
    
    dark: {
      bg: '#0f1219',
      card: '#1a1f36',
      border: '#2d3748',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
    },
    
    light: {
      bg: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#64748b',
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  layout: {
    sidebarWidth: '280px',
    sidebarCollapsed: '64px',
    headerHeight: '64px',
    aiPanelWidth: '320px',
  }
};

export const stageColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'business-planning': {
    bg: 'rgba(139, 92, 246, 0.1)',
    text: '#8b5cf6',
    border: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
  },
  'process-mapping': {
    bg: 'rgba(6, 182, 212, 0.1)',
    text: '#06b6d4',
    border: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
  },
  'solution-design': {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#f59e0b',
    border: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
  },
  'system-architecture': {
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#3b82f6',
    border: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
  },
  'prototype-design': {
    bg: 'rgba(236, 72, 153, 0.1)',
    text: '#ec4899',
    border: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)'
  },
  'detailed-design': {
    bg: 'rgba(20, 184, 166, 0.1)',
    text: '#14b8a6',
    border: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #2dd4bf)'
  },
  'test-cases': {
    bg: 'rgba(132, 204, 22, 0.1)',
    text: '#84cc16',
    border: '#84cc16',
    gradient: 'linear-gradient(135deg, #84cc16, #a3e635)'
  },
  'bp-testing': {
    bg: 'rgba(249, 115, 22, 0.1)',
    text: '#f97316',
    border: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)'
  },
  'acceptance': {
    bg: 'rgba(34, 197, 94, 0.1)',
    text: '#22c55e',
    border: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #4ade80)'
  },
  'configuration': {
    bg: 'rgba(99, 102, 241, 0.1)',
    text: '#6366f1',
    border: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
  },
  'operations': {
    bg: 'rgba(113, 113, 122, 0.1)',
    text: '#71717a',
    border: '#71717a',
    gradient: 'linear-gradient(135deg, #71717a, #a1a1aa)'
  }
};
