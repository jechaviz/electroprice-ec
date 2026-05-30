import { MANUAL_CATEGORY_TREE_CORE } from './manualCategoryTreeCore.mjs';
import { MANUAL_CATEGORY_TREE_EXPANSION } from './manualCategoryTreeExpansion.mjs';
import { MANUAL_CATEGORY_TREE_RECENT } from './manualCategoryTreeRecent.mjs';
import { MANUAL_CATEGORY_TREE_CYCLE003 } from './manualCategoryTreeCycle003.mjs';

export const MANUAL_CATEGORY_TREE = [
  ...MANUAL_CATEGORY_TREE_CORE,
  ...MANUAL_CATEGORY_TREE_EXPANSION,
  ...MANUAL_CATEGORY_TREE_RECENT,
  ...MANUAL_CATEGORY_TREE_CYCLE003,
];
