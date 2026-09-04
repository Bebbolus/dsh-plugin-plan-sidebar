/**
 * Tool category maps shared by every tag renderer: the ToolsTab row tags and
 * the dock-level ToolModalEditor meta tag both map a ToolCategory to its
 * localized key and pill-tint CSS class. Relocated from ToolDetailView.tsx
 * (deleted) so the maps survive the move of the detail dialog to the dock.
 */
import type { ToolCategory } from '../../../contract/tools.ts';
import type { ToolsKey } from './locales.ts';
/** Localized key per category, used for both the row tag and the modal tag. */
export declare const CATEGORY_KEY: Record<ToolCategory, ToolsKey>;
/** Tag CSS class per category (pill tint distinct per bucket). */
export declare const CATEGORY_CLASS: Record<ToolCategory, string>;
//# sourceMappingURL=category.d.ts.map