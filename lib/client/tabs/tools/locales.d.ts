/** Dictionary namespace owned by the tools tab. */
export declare const NS: "betterSidebar.tools";
/** Simplified-Chinese dictionary (source of truth for the key set). */
export declare const zh: {
    readonly tabLabel: "工具";
    readonly refresh: "刷新";
    readonly loading: "加载中…";
    readonly errorRetry: "重试";
    readonly errorTitle: "加载失败";
    readonly noWorkspace: "未打开工作区";
    readonly noWorkspaceHint: "工具标签页需要一个工作区目录。请在对话中选择或打开一个工作区。";
    readonly emptyTitle: "没有可用工具";
    readonly emptyHint: "当前没有可用的工具。";
    readonly warningTitle: "工具加载异常";
    readonly filterAll: "全部";
    readonly categoryBuiltin: "内置";
    readonly categoryMcp: "MCP";
    readonly categoryAgent: "智能体";
    readonly detailClose: "关闭";
    readonly detailSchemaTitle: "参数";
    readonly detailResize: "调整宽度";
    readonly detailResizeCorner: "调整大小";
    readonly noParameters: "无参数";
};
/** English dictionary, key-identical to the zh source of truth. */
export declare const en: Record<ToolsKey, string>;
/** Key domain of the tools namespace. */
export type ToolsKey = keyof typeof zh;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Tools tab copy. */
        'betterSidebar.tools': ToolsKey;
    }
}
//# sourceMappingURL=locales.d.ts.map