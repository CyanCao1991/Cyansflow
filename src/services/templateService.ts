import { STAGES } from '../constants/stages';
import { StageActivity, PromptTemplate } from '../types';

const TEMPLATE_STORAGE_KEY = 'bpflow-custom-templates';

export interface CustomTemplateData {
  [stageType: string]: {
    [activityIndex: number]: PromptTemplate;
  };
}

export const getCustomTemplates = (): CustomTemplateData => {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom templates:', error);
  }
  return {};
};

export const saveCustomTemplates = (templates: CustomTemplateData): void => {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save custom templates:', error);
  }
};

export const getActivityWithOverrides = (
  stageType: string,
  activityIndex: number
): StageActivity => {
  const defaultActivity = STAGES.find(s => s.type === stageType)?.activities[activityIndex];
  
  if (!defaultActivity) {
    throw new Error(`Activity not found: ${stageType}/${activityIndex}`);
  }
  
  const customTemplates = getCustomTemplates();
  const overrides = customTemplates[stageType]?.[activityIndex];
  
  if (!overrides) {
    return defaultActivity;
  }
  
  return {
    ...defaultActivity,
    promptTemplates: {
      qa: overrides.qa && overrides.qa.length > 0 ? overrides.qa : defaultActivity.promptTemplates.qa,
      summary: overrides.summary && overrides.summary.length > 0 ? overrides.summary : defaultActivity.promptTemplates.summary,
      output: overrides.output && overrides.output.length > 0 ? overrides.output : defaultActivity.promptTemplates.output,
    }
  };
};

export const saveActivityTemplate = (
  stageType: string,
  activityIndex: number,
  template: PromptTemplate
): void => {
  const customTemplates = getCustomTemplates();
  
  if (!customTemplates[stageType]) {
    customTemplates[stageType] = {};
  }
  
  customTemplates[stageType][activityIndex] = template;
  saveCustomTemplates(customTemplates);
};

export const resetActivityTemplate = (
  stageType: string,
  activityIndex: number
): void => {
  const customTemplates = getCustomTemplates();
  
  if (customTemplates[stageType]?.[activityIndex]) {
    delete customTemplates[stageType][activityIndex];
    saveCustomTemplates(customTemplates);
  }
};

export const resetAllTemplates = (): void => {
  saveCustomTemplates({});
};
