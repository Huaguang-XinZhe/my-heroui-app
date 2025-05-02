/**
 * Nord Deep 主题定义文件
 * 基于完整版 nord-deep-color-theme.json
 * 适配 Monaco 编辑器
 */

import { editor } from "monaco-editor";

// 主题定义
export const nordDeepTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: false, // 这个非常重要，没有这个，样式会有些许差异❗
  rules: [
    { token: "", foreground: "d8dee9" },
    { token: "comment", foreground: "78849b", fontStyle: "italic" },
    { token: "keyword", foreground: "81a1c1" },
    { token: "string", foreground: "a3be8c" },
    { token: "number", foreground: "bf616a" },
    { token: "regexp", foreground: "ebcb8b" },
    { token: "operator", foreground: "81a1c1" },
    { token: "namespace", foreground: "8fbcbb" },
    { token: "type.identifier", foreground: "8fbcbb" },
    { token: "constructor", foreground: "88c0d0" },
    { token: "variable", foreground: "d8dee9" },
    { token: "variable.predefined", foreground: "81a1c1" },
    { token: "function", foreground: "88c0d0" },
    { token: "tag", foreground: "81a1c1" },
    { token: "tag.attribute.name", foreground: "8fbcbb" },
    { token: "attribute.name", foreground: "8fbcbb" },
    { token: "attribute.value", foreground: "a3be8c" },
    { token: "delimiter", foreground: "eceff4" },
    { token: "delimiter.html", foreground: "81a1c1" },
    { token: "punctuation", foreground: "eceff4" },
    { token: "constant.language", foreground: "81a1c1" },
    { token: "entity.name.class", foreground: "8fbcbb" },
    { token: "entity.name.function", foreground: "88c0d0" },
    { token: "entity.other.attribute-name", foreground: "8fbcbb" },
    { token: "support.class", foreground: "8fbcbb" },
    { token: "support.function", foreground: "88c0d0" },
    { token: "support.constant", foreground: "81a1c1" },
    { token: "support.type", foreground: "8fbcbb" },
    { token: "constant.numeric", foreground: "bf616a" },
    { token: "meta.preprocessor", foreground: "5e81ac" },
    {
      token: "keyword.control.directive",
      foreground: "5e81ac",
      fontStyle: "bold",
    },
  ],
  colors: {
    // 编辑器基础颜色
    "editor.background": "#1d2129",
    "editor.foreground": "#d8dee9",
    "editor.selectionBackground": "#434c5ecc",
    "editor.lineHighlightBackground": "#292e39",
    "editor.lineHighlightBorder": "#292e39",
    "editorCursor.foreground": "#d8dee9",
    "editorWhitespace.foreground": "#4c566ab3",
    "editorIndentGuide.background": "#434c5eb3",
    "editorIndentGuide.activeBackground": "#4c566a",
    "editor.selectionHighlightBackground": "#434c5e52",
    "editor.wordHighlightBackground": "#81a1c166",
    "editor.wordHighlightStrongBackground": "#81a1c199",
    "editor.findMatchBackground": "#88c0d066",
    "editor.findMatchHighlightBackground": "#88c0d033",
    "editor.findRangeHighlightBackground": "#88c0d033",

    // 括号高亮
    "editorBracketMatch.background": "#1d212900",
    "editorBracketMatch.border": "#88c0d0",
    "editorBracketHighlight.foreground1": "#b88855",
    "editorBracketHighlight.foreground2": "#d5d266",
    "editorBracketHighlight.foreground3": "#89d17a",
    "editorBracketHighlight.foreground4": "#5db8af",
    "editorBracketHighlight.foreground5": "#666fad",
    "editorBracketHighlight.foreground6": "#8e4d9a",
    "editorBracketHighlight.unexpectedBracket.foreground": "#ff0000",

    // 行号
    "editorLineNumber.foreground": "#4c566a",
    "editorLineNumber.activeForeground": "#d8dee9",

    // 建议窗口
    "editorSuggestWidget.background": "#1d2129",
    "editorSuggestWidget.border": "#292e39",
    "editorSuggestWidget.foreground": "#d8dee9",
    "editorSuggestWidget.highlightForeground": "#88c0d0",
    "editorSuggestWidget.selectedBackground": "#434c5e",
    "editorSuggestWidget.selectedForeground": "#88c0d0",

    // 悬浮窗口
    "editorHoverWidget.background": "#292e39",
    "editorHoverWidget.border": "#292e39",
    "editorHoverWidget.foreground": "#d8dee9",
    "editorHoverWidget.statusBarBackground": "#232731",

    // 链接
    "editorLink.activeForeground": "#88c0d0",

    // Diff 编辑
    "diffEditor.insertedTextBackground": "#88c0d009",
    "diffEditor.removedTextBackground": "#bf616a4d",

    // 滚动条
    "scrollbar.shadow": "#00000066",
    "scrollbarSlider.background": "#434c5e99",
    "scrollbarSlider.hoverBackground": "#434c5eaa",
    "scrollbarSlider.activeBackground": "#434c5eaa",

    // 小地图
    "minimap.findMatchHighlight": "#88c0d0",

    // 搜索窗口（Ctrl+F）相关样式
    findMatchHighlight: "#88c0d066",
    findRangeHighlight: "#3b4252",
    "editor.findMatchBorder": "#88c0d0",
    "editor.findMatchHighlightBorder": "#88c0d066",
    "widget.shadow": "#00000066",
    "editorWidget.background": "#1d2129",
    "editorWidget.border": "#292e39",
    "editorWidget.resizeBorder": "#88c0d0",
    "editorWidget.foreground": "#d8dee9",
    "editorRuler.foreground": "#434c5e",
    "inputValidation.errorBackground": "#bf616a",
    "inputValidation.errorBorder": "#bf616a",
    "input.background": "#292e39",
    "input.border": "#292e39",
    "input.foreground": "#d8dee9",
    "input.placeholderForeground": "#d8dee999",
    "button.background": "#434c5e",
    "button.foreground": "#d8dee9",
    "button.hoverBackground": "#4c566a",
    focusBorder: "#88c0d066",

    // 快速输入框和命令面板
    "quickInput.background": "#1d2129",
    "quickInput.foreground": "#d8dee9",
    "quickInputTitle.background": "#292e39",
    "inputOption.activeBorder": "#88c0d0",
    "inputOption.activeBackground": "#3b4252",
    "searchEditor.findMatchBackground": "#88c0d066",
    "pickerGroup.border": "#292e39",
    "pickerGroup.foreground": "#88c0d0",

    // 菜单相关
    "menu.background": "#1d2129",
    "menu.foreground": "#d8dee9",
    "menu.selectionBackground": "#434c5e",
    "menu.selectionForeground": "#88c0d0",
    "menu.selectionBorder": "#292e39",
    "menu.separatorBackground": "#292e39",
    "menu.border": "#292e39",
    "menubar.selectionBackground": "#292e39",
    "menubar.selectionForeground": "#d8dee9",

    // 上下文菜单
    "list.hoverBackground": "#292e39",
    "list.hoverForeground": "#d8dee9",
    "list.activeSelectionBackground": "#81a1c14d",
    "list.activeSelectionForeground": "#88c0d0",
    "list.inactiveSelectionBackground": "#434c5e",
    "list.inactiveSelectionForeground": "#d8dee9",
    "list.focusBackground": "#88c0d099",
    "list.focusForeground": "#d8dee9",
    "list.highlightForeground": "#88c0d0",
    "list.focusHighlightForeground": "#ffffff",

    // 面板边框
    "panel.border": "#292e39",
    "panelTitle.activeForeground": "#88c0d0",
    "panelTitle.inactiveForeground": "#d8dee9",
  },
};
