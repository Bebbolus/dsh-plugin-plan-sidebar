import styles from './tools.module.css';
/** Localized key per category, used for both the row tag and the modal tag. */
export const CATEGORY_KEY = {
    builtin: 'categoryBuiltin',
    mcp: 'categoryMcp',
    agent: 'categoryAgent',
};
/** Tag CSS class per category (pill tint distinct per bucket). */
export const CATEGORY_CLASS = {
    builtin: styles.tagBuiltin ?? '',
    mcp: styles.tagMcp ?? '',
    agent: styles.tagAgent ?? '',
};
//# sourceMappingURL=category.js.map