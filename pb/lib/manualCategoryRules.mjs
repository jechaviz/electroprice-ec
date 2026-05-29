import { MANUAL_CATEGORY_RULES_RECENT } from './manualCategoryRulesRecent.mjs';
import { MANUAL_CATEGORY_RULES_CORE } from './manualCategoryRulesCore.mjs';
import { MANUAL_CATEGORY_RULES_EXPANSION } from './manualCategoryRulesExpansion.mjs';

export const MANUAL_CATEGORY_RULES = [
  ...MANUAL_CATEGORY_RULES_RECENT,
  ...MANUAL_CATEGORY_RULES_CORE,
  ...MANUAL_CATEGORY_RULES_EXPANSION,
];
