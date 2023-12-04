import type { ICellData, IMutationInfo, IRange, IRowData, ObjectMatrixPrimitiveType, Worksheet } from '@univerjs/core';
import {
    BooleanNumber,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    Disposable,
    handleStyleToString,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectArray,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowHeightMutationParams,
} from '@univerjs/sheets';
import {
    InsertColMutation,
    InsertRowMutation,
    MAX_CELL_PER_SHEET_KEY,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { IMessageService, textTrim } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import type {
    COPY_TYPE,
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    ISheetClipboardHook,
} from '../../services/clipboard/type';
import {
    getClearAndSetMergeMutations,
    getClearCellStyleMutations,
    getDefaultOnPasteCellMutations,
    getSetCellStyleMutations,
    getSetCellValueMutations,
} from './utils';

/**
 * This controller add basic clipboard logic for basic features such as text color / BISU / row widths to the clipboard
 * service. You can create a similar clipboard controller to add logic for your own features.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetClipboardController)
export class SheetClipboardController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverSheet: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localService: LocaleService
    ) {
        super();
        // this._commandExecutedListener();
        this._init();
    }

    private _init() {
        // register sheet clipboard commands
        [SheetCopyCommand, SheetCutCommand, SheetPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );

        [
            SheetPasteValueCommand,
            SheetPasteFormatCommand,
            SheetPasteColWidthCommand,
            SheetPasteBesidesBorderCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
        // register basic sheet clipboard hooks
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initCopyingHooks()));
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook(this._initPastingHook()));
        const disposables = this._initSpecialPasteHooks().map((hook) =>
            this._sheetClipboardService.addClipboardHook(hook)
        );
        this.disposeWithMe({ dispose: () => disposables.forEach((d) => d.dispose()) });
    }

    private _initCopyingHooks(): ISheetClipboardHook {
        const self = this;
        let currentSheet: Worksheet | null = null;
        return {
            hookName: PREDEFINED_HOOK_NAME.DEFAULT_COPY,
            isDefaultHook: true,
            onBeforeCopy(workbookId, worksheetId) {
                currentSheet = self._getWorksheet(workbookId, worksheetId);
            },
            onCopyCellContent(row: number, col: number): string {
                const v = currentSheet!.getCell(row, col);
                return v?.m || '';
            },
            onCopyCellStyle: (row: number, col: number, rowSpan?: number, colSpan?: number) => {
                const properties: IClipboardPropertyItem = {};

                if (rowSpan || colSpan) {
                    properties.rowspan = `${rowSpan || 1}`;
                    properties.colspan = `${colSpan || 1}`;
                }

                // TODO@wzhudev: should deprecate Range and
                // use worksheet.getStyle()
                const range = currentSheet!.getRange(row, col);
                const textStyle = range.getTextStyle();
                // const color = range.getFontColor();
                // const backgroundColor = range.getBackground();

                let style = '';
                // if (color) {
                //     style += `color: ${color};`;
                // }
                // if (backgroundColor) {
                //     style += `background-color: ${backgroundColor};`;
                // }
                // if (textStyle?.bl) {
                //     style += 'font-weight: bold;';
                // }
                // if (textStyle?.fs) {
                //     style += `font-size: ${textStyle.fs}px;`;
                // }
                // if (textStyle?.tb === WrapStrategy.WRAP) {
                //     style += 'word-wrap: break-word;';
                // }
                // if (textStyle?.it) {
                //     style += 'font-style: italic;';
                // }
                // if (textStyle?.ff) {
                //     style += `font-family: ${textStyle.ff};`;
                // }
                // if (textStyle?.st) {
                //     style += 'text-decoration: line-through;';
                // }
                // if (textStyle?.ul) {
                //     style += 'text-decoration: underline';
                // }

                if (textStyle) {
                    style = handleStyleToString(textStyle);
                }

                if (style) {
                    properties.style = style;
                }

                return properties;
            },
            onCopyColumn(col: number) {
                const sheet = currentSheet!;
                const width = sheet.getColumnWidth(col);
                return {
                    width: `${width}`,
                };
            },
            onCopyRow(row: number) {
                const sheet = currentSheet!;
                const height = sheet.getRowHeight(row);
                return {
                    style: `height: ${height}px;`,
                };
            },
            onAfterCopy() {
                currentSheet = null;
            },
        };
    }

    private _initPastingHook(): ISheetClipboardHook {
        const self = this;

        let workbookId: string | null = null;
        let worksheetId: string | null = null;
        let currentSheet: Worksheet | null = null;

        return {
            hookName: PREDEFINED_HOOK_NAME.DEFAULT_PASTE,
            isDefaultHook: true,
            onBeforePaste(workbookId_, worksheetId_, range) {
                currentSheet = self._getWorksheet(workbookId_, worksheetId_);
                workbookId = workbookId_;
                worksheetId = worksheetId_;

                // examine if pasting would cause number of cells to exceed the upper limit
                // this is not implemented yet
                const maxConfig = self._configService.getConfig<number>(MAX_CELL_PER_SHEET_KEY);
                const { endRow, endColumn } = range;
                if (maxConfig && endRow * endColumn > maxConfig) {
                    self._messageService.show({
                        type: MessageType.Error,
                        content: self._localService.t('clipboard.paste.exceedMaxCells'),
                    }); // TODO: show error info
                    return false;
                }

                return true;
            },

            onPasteRows(range, rowProperties) {
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxRow = currentSheet!.getMaxRows();
                const addingRowsCount = range.endRow - maxRow;
                const existingRowsCount = rowProperties.length - addingRowsCount;
                if (addingRowsCount > 0) {
                    const rowInfo = new ObjectArray<IRowData>();
                    rowProperties.slice(existingRowsCount).forEach((property, index) => {
                        const style = property?.style;
                        if (!style) {
                            return;
                        }
                        const cssTextArray = style.split(';');
                        let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                        cssTextArray.find((css) => {
                            css = css.toLowerCase();
                            const key = textTrim(css.substr(0, css.indexOf(':')));
                            const value = textTrim(css.substr(css.indexOf(':') + 1));
                            if (key === 'height') {
                                height = parseFloat(value);
                                return true;
                            }
                            return false;
                        });

                        rowInfo.set(index, {
                            h: height,
                            hd: BooleanNumber.FALSE,
                        });
                    });

                    const addRowMutation: IInsertRowMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, startRow: maxRow }],
                        rowInfo,
                    };
                    redoMutations.push({
                        id: InsertRowMutation.id,
                        params: addRowMutation,
                    });
                }

                // get row height of existing rows
                // TODO When Excel pasted, there was no width height, Do we still need to set the height?
                const rowHeight = new ObjectArray<number>();
                rowProperties.slice(0, existingRowsCount).forEach((property, index) => {
                    const style = property.style;
                    if (!style) {
                        return;
                    }
                    const cssTextArray = style.split(';');
                    let height = DEFAULT_WORKSHEET_ROW_HEIGHT;

                    cssTextArray.find((css) => {
                        css = css.toLowerCase();
                        const key = textTrim(css.substr(0, css.indexOf(':')));
                        const value = textTrim(css.substr(css.indexOf(':') + 1));
                        if (key === 'height') {
                            height = parseFloat(value);
                            return true;
                        }
                        return false;
                    });

                    rowHeight.set(index, height);
                });

                // apply row properties to the existing rows
                const setRowPropertyMutation: ISetWorksheetRowHeightMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endRow, maxRow) }],
                    rowHeight,
                };
                redoMutations.push({
                    id: SetWorksheetRowHeightMutation.id,
                    params: setRowPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteColumns(range, colProperties, pasteType) {
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.endColumn - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;

                if (addingColsCount > 0) {
                    const addColMutation: IInsertColMutationParams = {
                        workbookId: workbookId!,
                        worksheetId: worksheetId!,
                        ranges: [{ ...range, startColumn: maxColumn }],
                        colInfo: new ObjectArray(
                            colProperties.slice(existingColsCount).map((property) => ({
                                w: property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH,
                                hd: BooleanNumber.FALSE,
                            }))
                        ),
                    };
                    redoMutations.push({
                        id: InsertColMutation.id,
                        params: addColMutation,
                    });
                }
                // apply col properties to the existing rows
                const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endColumn, maxColumn) }],
                    colWidth: new ObjectArray(
                        colProperties
                            .slice(0, existingColsCount)
                            .map((property) => (property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH))
                    ),
                };
                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },

            onPasteCells(range, matrix, pasteType, copyInfo) {
                return self._onPasteCells(range, matrix, workbookId!, worksheetId!, pasteType, copyInfo);
            },

            onAfterPaste(success) {
                currentSheet = null;
            },
        };
    }

    private _onPasteCells(
        pastedRange: IRange,
        matrix: ObjectMatrix<ICellDataWithSpanInfo>,
        workbookId: string,
        worksheetId: string,
        pasteType: string,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IRange;
        }
    ): {
        redos: IMutationInfo[];
        undos: IMutationInfo[];
    } {
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        return getDefaultOnPasteCellMutations(pastedRange, matrix, workbookId, worksheetId, copyInfo, accessor);
    }

    private _initSpecialPasteHooks() {
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        const self = this;

        const specialPasteValueHook: ISheetClipboardHook = {
            hookName: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            specialPasteInfo: {
                label: 'specialPaste.value',
            },
            onPasteCells: (pastedRange, matrix, pasteType, copyInfo) => {
                const workbook = self._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();
                return getSetCellValueMutations(workbookId, worksheetId, pastedRange, matrix, accessor);
            },
        };
        const specialPasteFormatHook: ISheetClipboardHook = {
            hookName: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            specialPasteInfo: {
                label: 'specialPaste.format',
            },
            onPasteCells(pastedRange, matrix, pasteType, copyInfo) {
                const workbook = self._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];

                // clear cell style
                const { undos: styleUndos, redos: styleRedos } = getClearCellStyleMutations(
                    workbookId,
                    worksheetId,
                    pastedRange,
                    matrix,
                    accessor
                );
                redoMutationsInfo.push(...styleRedos);
                undoMutationsInfo.push(...styleUndos);

                // clear and set merge
                const { undos: mergeUndos, redos: mergeRedos } = getClearAndSetMergeMutations(
                    workbookId,
                    worksheetId,
                    pastedRange,
                    matrix,
                    accessor
                );
                redoMutationsInfo.push(...mergeRedos);
                undoMutationsInfo.push(...mergeUndos);

                const { undos: setStyleUndos, redos: setStyleRedos } = getSetCellStyleMutations(
                    workbookId,
                    worksheetId,
                    pastedRange,
                    matrix,
                    accessor
                );

                redoMutationsInfo.push(...setStyleRedos);
                undoMutationsInfo.push(...setStyleUndos);

                return {
                    undos: undoMutationsInfo,
                    redos: redoMutationsInfo,
                };
            },
        };

        const specialPasteColWidthHook: ISheetClipboardHook = {
            hookName: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
            specialPasteInfo: {
                label: 'specialPaste.colWidth',
            },
            onPasteCells() {
                return {
                    undos: [],
                    redos: [],
                };
            },
            onPasteColumns(range, colProperties, pasteType) {
                const workbook = self._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();
                const redoMutations: IMutationInfo[] = [];
                const undoMutations: IMutationInfo[] = [];
                const currentSheet = self._getWorksheet(workbookId, worksheetId);

                // if the range is outside ot the worksheet's boundary, we should add rows
                const maxColumn = currentSheet!.getMaxColumns();
                const addingColsCount = range.endColumn - maxColumn;
                const existingColsCount = colProperties.length - addingColsCount;

                const setColPropertyMutation: ISetWorksheetColWidthMutationParams = {
                    workbookId: workbookId!,
                    worksheetId: worksheetId!,
                    ranges: [{ ...range, endRow: Math.min(range.endColumn, maxColumn) }],
                    colWidth: new ObjectArray(
                        colProperties
                            .slice(0, existingColsCount)
                            .map((property) => (property.width ? +property.width : DEFAULT_WORKSHEET_COLUMN_WIDTH))
                    ),
                };
                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                redoMutations.push({
                    id: SetWorksheetColWidthMutation.id,
                    params: setColPropertyMutation,
                });

                // TODO: add undo mutations but we cannot do it now because underlying mechanism is not ready

                return {
                    redos: redoMutations,
                    undos: [] || undoMutations,
                };
            },
        };

        const specialPasteBesidesBorder: ISheetClipboardHook = {
            hookName: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER,
            specialPasteInfo: {
                label: 'specialPaste.besidesBorder',
            },
            onPasteCells(pastedRange, matrix, pasteType, copyInfo) {
                const workbook = self._currentUniverSheet.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();
                const redoMutationsInfo: IMutationInfo[] = [];
                const undoMutationsInfo: IMutationInfo[] = [];
                const { startColumn, startRow, endColumn, endRow } = pastedRange;
                const valueMatrix = new ObjectMatrix<ICellData>();

                // TODO@Dushusir: undo selection
                matrix.forValue((row, col, value) => {
                    const style = value.s;
                    if (typeof style === 'object') {
                        valueMatrix.setValue(row + startRow, col + startColumn, {
                            s: { ...style, bd: undefined },
                            v: value.v,
                        });
                    }
                });

                // set cell value and style
                const setValuesMutation: ISetRangeValuesMutationParams = {
                    workbookId,
                    worksheetId,
                    cellValue: valueMatrix.getData(),
                };

                redoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: setValuesMutation,
                });

                // undo
                const undoSetValuesMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
                    accessor,
                    setValuesMutation
                );

                undoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: undoSetValuesMutation,
                });

                const { undos, redos } = getClearAndSetMergeMutations(
                    workbookId,
                    worksheetId,
                    pastedRange,
                    matrix,
                    accessor
                );
                undoMutationsInfo.push(...undos);
                redoMutationsInfo.push(...redos);

                return {
                    redos: redoMutationsInfo,
                    undos: undoMutationsInfo,
                };
            },
        };

        return [specialPasteValueHook, specialPasteFormatHook, specialPasteColWidthHook, specialPasteBesidesBorder];
    }

    private _getWorksheet(workbookId: string, worksheetId: string): Worksheet {
        const worksheet = this._currentUniverSheet.getUniverSheetInstance(workbookId)?.getSheetBySheetId(worksheetId);

        if (!worksheet) {
            throw new Error(
                `[SheetClipboardController]: cannot find a worksheet with workbookId ${workbookId} and worksheetId ${worksheetId}.`
            );
        }

        return worksheet;
    }
}

// Generate cellValue from range and set null
function generateNullCellValue(range: IRange[]): ObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, null);
            }
        }
    });

    return cellValue.getData();
}