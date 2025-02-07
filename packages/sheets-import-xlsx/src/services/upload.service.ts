/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    BooleanNumber,
    ICellData,
    IColumnData,
    IKeyValue,
    IObjectArrayPrimitiveType,
    IRowData,
    IStyleData,
    ITextRun,
    ITextStyle,
    IWorkbookData,
    IWorksheetData,
} from '@univerjs/core';
import { HorizontalAlign, IUniverInstanceService, Tools, VerticalAlign, WrapStrategy } from '@univerjs/core';

// @ts-ignore
// import * as LuckyExcel from 'luckyexcel'; // no type definition for package luckyexcel
import { border } from './border';

export function migrate(config: any): Partial<IWorkbookData> {
    const newConfig: Partial<IWorkbookData> = {};
    newConfig.styles = {};
    if (config.hasOwnProperty('lang')) {
        newConfig.locale = config.lang;
    }
    if (config.hasOwnProperty('data')) {
        newConfig.sheets = {};
        for (const sheet of config.data) {
            const newSheet: Partial<IWorksheetData> = {};

            //  id
            // if (sheet.hasOwnProperty('index')) {
            //     newSheet.id = sheet.index as string;
            // } else {
            newSheet.id = Tools.generateRandomId(6);
            // }

            // 缩放比例
            if (sheet.hasOwnProperty('zoomRatio')) {
                newSheet.zoomRatio = sheet.zoomRatio;
            }

            // 最大行号
            if (sheet.hasOwnProperty('row')) {
                newSheet.rowCount = sheet.row;
            }

            // 最大列号
            if (sheet.hasOwnProperty('column')) {
                newSheet.columnCount = sheet.column;
            }

            // 是否激活
            if (sheet.hasOwnProperty('status')) {
                newSheet.status = parseInt(sheet.status);
            }

            // sheet 名称
            if (sheet.hasOwnProperty('name')) {
                newSheet.name = sheet.name;
            }

            // 激活选区
            if (sheet.hasOwnProperty('universheet_select_save')) {
                newSheet.selections = [];
                sheet.universheet_select_save.forEach((selection: IKeyValue) => {
                    newSheet.selections?.push({
                        startRow: selection.row[0],
                        endRow: selection.row[1],
                        startColumn: selection.column[0],
                        endColumn: selection.column[1],
                    });
                });
            }

            // 横向滚动条位置
            if (sheet.hasOwnProperty('scrollLeft')) {
                newSheet.scrollLeft = sheet.scrollLeft;
            }

            // 竖向滚动条位置
            if (sheet.hasOwnProperty('scrollTop')) {
                newSheet.scrollTop = sheet.scrollTop;
            }

            if (sheet.hasOwnProperty('config')) {
                // 合并单元格
                if (sheet.config.merge) {
                    newSheet.mergeData = [];
                    for (const key of Object.keys(sheet.config.merge)) {
                        const merge: {
                            r: number;
                            c: number;
                            rs: number;
                            cs: number;
                        } = sheet.config.merge[key];
                        const mergeReact = {
                            startRow: merge.r,
                            endRow: merge.r + merge.rs - 1,
                            startColumn: merge.c,
                            endColumn: merge.c + merge.cs - 1,
                        };
                        newSheet.mergeData.push(mergeReact);
                    }
                }

                // 边框，先按顺序设置到每一个单元格对象中，设置时需要遍历四个方向的相邻单元格做去重，最后单元格样式确定之后，再统一提取到styles上
                if (sheet.config.borderInfo) {
                    border(newSheet, sheet);
                }

                // 行高
                if (sheet.config.rowlen) {
                    newSheet.rowData = {};
                    for (const [rowIndex, height] of Object.entries(sheet.config.rowlen)) {
                        newSheet.rowData[Number(rowIndex)] = {
                            h: Number(height),
                            hd: 0,
                        };
                    }
                }
                // 列宽
                if (sheet.config.columnlen) {
                    newSheet.columnData = {};
                    for (const [colIndex, width] of Object.entries(sheet.config.columnlen)) {
                        newSheet.columnData[Number(colIndex)] = {
                            w: Number(width),
                            hd: 0,
                        };
                    }
                }
                // 隐藏行
                if (sheet.config.rowhidden) {
                    if (!newSheet.rowData) newSheet.rowData = {};
                    const rowData = newSheet.rowData as IObjectArrayPrimitiveType<Partial<IRowData>>;
                    for (const [rowIndex, isHidden] of Object.entries(sheet.config.rowhidden)) {
                        if (!rowData[Number(rowIndex)]) {
                            rowData[Number(rowIndex)] = {};
                        }

                        rowData[Number(rowIndex)].hd = isHidden as BooleanNumber;
                    }
                }
                // 隐藏列
                if (sheet.config.colhidden) {
                    if (!newSheet.columnData) newSheet.columnData = {};
                    const columnData = newSheet.columnData as IObjectArrayPrimitiveType<Partial<IColumnData>>;
                    for (const [colIndex, isHidden] of Object.entries(sheet.config.colhidden)) {
                        if (!columnData[Number(colIndex)]) {
                            columnData[Number(colIndex)] = {};
                        }
                        columnData[Number(colIndex)].hd = isHidden as BooleanNumber;
                    }
                }
            }

            // 单元格数据
            if (sheet.hasOwnProperty('celldata')) {
                if (!newSheet.cellData) {
                    newSheet.cellData = {};
                }

                for (const cellItem of sheet.celldata) {
                    if (!newSheet.cellData[cellItem.r]) {
                        newSheet.cellData[cellItem.r] = {};
                    }
                    if (!newSheet.cellData[cellItem.r][cellItem.c]) {
                        newSheet.cellData[cellItem.r][cellItem.c] = {};
                    }

                    const cell = cellItem.v;

                    const newCell: ICellData = newSheet.cellData[cellItem.r][cellItem.c];

                    if (cell?.ct?.t === 'inlineStr') {
                        const textRuns: ITextRun[] = [];
                        let dataStream = '';

                        cell.ct.s.forEach((element: any) => {
                            const textStyle: ITextStyle = {};

                            // 背景颜色
                            if (element.hasOwnProperty('bg')) {
                                textStyle.bg = {
                                    rgb: element.fc,
                                };
                            }

                            // 字体
                            if (element.hasOwnProperty('ff')) {
                                textStyle.ff = element.ff;
                            }

                            // 字体颜色
                            if (element.hasOwnProperty('fc')) {
                                textStyle.cl = {
                                    rgb: element.fc,
                                };
                            }

                            // 字体大小
                            if (element.hasOwnProperty('fs')) {
                                textStyle.fs = element.fs;
                            }

                            // 粗体
                            if (element.hasOwnProperty('bl')) {
                                textStyle.bl = element.bl;
                            }

                            // 斜体
                            if (element.hasOwnProperty('it')) {
                                textStyle.it = element.it;
                            }

                            // 删除线
                            if (element.hasOwnProperty('cl')) {
                                textStyle.st = {
                                    s: 1,
                                };
                            }

                            // 下划线
                            if (element.hasOwnProperty('un')) {
                                textStyle.ul = {
                                    s: element.un,
                                };
                            }

                            const sId = Tools.generateRandomId(6);
                            dataStream += element.v;
                            textRuns.push({
                                sId,
                                st: 0,
                                ed: element.v.length - 1,
                                ts: textStyle,
                            });
                        });

                        dataStream += '\r\n';

                        newCell.p = {
                            id: Tools.generateRandomId(6),
                            body: {
                                dataStream,
                                textRuns,
                            },
                            documentStyle: {},
                        };
                    } else {
                        // 原始值
                        if (cell.hasOwnProperty('v')) {
                            newCell.v = cell.v;
                        }

                        const cellStyle: IStyleData = {};

                        // 背景颜色
                        if (cell.hasOwnProperty('bg')) {
                            cellStyle.bg = {
                                rgb: cell.bg,
                            };
                        }

                        // 	字体
                        if (cell.hasOwnProperty('ff')) {
                            cellStyle.ff = cell.ff;
                        }

                        // 字体颜色
                        if (cell.hasOwnProperty('fc')) {
                            cellStyle.cl = {
                                rgb: cell.fc,
                            };
                        }

                        // 字体大小
                        if (cell.hasOwnProperty('fs')) {
                            cellStyle.fs = cell.fs;
                        }

                        // 粗体
                        if (cell.hasOwnProperty('bl')) {
                            cellStyle.bl = cell.bl;
                        }

                        // 斜体
                        if (cell.hasOwnProperty('it')) {
                            cellStyle.it = cell.it;
                        }

                        // 删除线
                        if (cell.hasOwnProperty('cl')) {
                            cellStyle.st = {
                                s: cell.cl,
                            };
                        }

                        // 下划线
                        if (cell.hasOwnProperty('un')) {
                            cellStyle.ul = {
                                s: cell.un,
                            };
                        }

                        const sMap = {
                            '0': VerticalAlign.MIDDLE,
                            '1': VerticalAlign.TOP,
                            '2': VerticalAlign.BOTTOM,
                        };
                        // const sMap = {
                        //     '0': 2,
                        //     '1': 1,
                        //     '2': 3,
                        // };

                        // 垂直对齐
                        if (cell.hasOwnProperty('vt')) {
                            switch (String(cell.vt)) {
                                case '0':
                                    cellStyle.vt = VerticalAlign.MIDDLE;
                                    break;
                                case '1':
                                    cellStyle.vt = VerticalAlign.TOP;
                                    break;
                                case '2':
                                    cellStyle.vt = VerticalAlign.BOTTOM;
                                    break;

                                default:
                                    break;
                            }
                            // cellStyle.vt = sMap[String(cell.vt)];
                        }

                        // 水平对齐
                        if (cell.hasOwnProperty('ht')) {
                            switch (String(cell.ht)) {
                                case '0':
                                    cellStyle.ht = HorizontalAlign.CENTER;
                                    break;
                                case '1':
                                    cellStyle.ht = HorizontalAlign.LEFT;
                                    break;
                                case '2':
                                    cellStyle.ht = HorizontalAlign.RIGHT;
                                    break;

                                default:
                                    break;
                            }
                            // cellStyle.ht = sMap[String(cell.ht)];
                        }

                        // 竖排文字
                        if (cell.hasOwnProperty('tr')) {
                            switch (cell.tr) {
                                case '0':
                                    cellStyle.tr = {
                                        a: 0,
                                        v: 0,
                                    };
                                    break;

                                case '1':
                                    cellStyle.tr = {
                                        a: 45,
                                        v: 0,
                                    };
                                    break;

                                case '2':
                                    cellStyle.tr = {
                                        a: -45,
                                        v: 0,
                                    };
                                    break;

                                case '3':
                                    cellStyle.tr = {
                                        a: 0,
                                        v: 1,
                                    };
                                    break;

                                case '4':
                                    cellStyle.tr = {
                                        a: 90,
                                        v: 0,
                                    };
                                    break;

                                case '5':
                                    cellStyle.tr = {
                                        a: -90,
                                        v: 0,
                                    };
                                    break;

                                default:
                                    break;
                            }
                        }

                        // 文字旋转角度
                        if (cell.hasOwnProperty('rt')) {
                            cellStyle.tr = {
                                a: cell.tr,
                                v: 0,
                            };
                        }

                        // 文本换行
                        if (cell.hasOwnProperty('tb')) {
                            switch (String(cell.tb)) {
                                case '0':
                                    cellStyle.tb = WrapStrategy.CLIP;
                                    break;
                                case '1':
                                    cellStyle.tb = WrapStrategy.OVERFLOW;
                                    break;
                                case '2':
                                    cellStyle.tb = WrapStrategy.WRAP;
                                    break;

                                default:
                                    break;
                            }
                            //cellStyle.tb = sMap[String(cell.tb)];
                        }

                        newCell.s = Object.assign(newCell.s || {}, cellStyle);
                    }
                }
            }

            newConfig.sheets[newSheet.id] = newSheet;
        }
    }
    return newConfig;
}

export class UploadService {
    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {}

    upload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        input.addEventListener('change', (evt) => {
            const element = evt.currentTarget as HTMLInputElement;
            this.handleFiles(element.files);
        });

        input.click();
    }

    handleFiles(files: File[] | FileList | null) {
        if (files == null || files.length === 0) {
            console.error('No files wait for import');
            return;
        }

        const name = files[0].name;
        const suffixArr = name.split('.');
        const suffix = suffixArr[suffixArr.length - 1];
        if (suffix !== 'xlsx') {
            console.error('Currently only supports the import of xlsx files');
            return;
        }
        // @ts-ignore
        const transformExcelToLucky = LuckyExcel.default.transformExcelToLucky;

        transformExcelToLucky(files[0], (exportJson: IKeyValue) => {
            if (exportJson.sheets == null || exportJson.sheets.length === 0) {
                console.error('Failed to read the content of the excel file, currently does not support xls files!');
                return;
            }

            const luckysheetConfig = {
                container: 'universheet',
                data: exportJson.sheets,
                title: exportJson.info.name,
            };
            const univerWorkbookConfig = migrate(luckysheetConfig);

            const sheets = univerWorkbookConfig.sheets;

            if (!sheets) {
                return console.error('No content');
            }

            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            if (!workbook) {
                return false;
            }

            const unitId = workbook.getUnitId();
            const order = Tools.deepClone(workbook.getConfig().sheetOrder);

            // add new sheets
            Object.keys(sheets).forEach((sheetId, i) => {
                const sheetData = sheets[sheetId];
                // workbook.insertSheet(sheetData);
                const index = order.length - 1 + i;
                // this._basicWorkbookController.insertSheet(index, sheetData, unitId);
            });

            // remove other sheets
            order.forEach((sheetId: string) => {
                // workbook.removeSheetBySheetId(sheetId);
                // workbook.removeSheetBySheetId(sheetId);
                // this._basicWorkbookController.removeSheet(sheetId, unitId);
            });
        });
    }
}
