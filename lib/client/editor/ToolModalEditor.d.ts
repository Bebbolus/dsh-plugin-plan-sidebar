import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolDetailEvents } from '../tabs/tools/events.ts';
export interface ToolModalEditorProps {
    /** The shared tool-detail event source (the tools tab emits into it). */
    events: ToolDetailEvents;
    /** Bound tools-namespace translate (locale-aware copy). */
    t: TranslateNS<'betterSidebar.tools'>;
}
export declare function ToolModalEditor({ events, t }: ToolModalEditorProps): JSX.Element | null;
//# sourceMappingURL=ToolModalEditor.d.ts.map