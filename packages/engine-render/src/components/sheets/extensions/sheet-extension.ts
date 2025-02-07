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

import type { IRange } from '@univerjs/core';

import { getCellByIndex } from '../../../basics/tools';
import { ComponentExtension } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';

export enum SHEET_EXTENSION_TYPE {
    GRID,
}

export class SheetExtension extends ComponentExtension<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE, IRange[]> {
    override type = SHEET_EXTENSION_TYPE.GRID;

    getCellIndex(
        rowIndex: number,
        columnIndex: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache: IRange[]
    ) {
        return getCellByIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
    }

    isRenderDiffRangesByCell(row: number, column: number, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startRow, startColumn, endRow, endColumn } = range;
            if (row >= startRow && row <= endRow && column >= startColumn && column <= endColumn) {
                return true;
            }
        }

        return false;
    }

    isRenderDiffRangesByColumn(column: number, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startColumn, endColumn } = range;
            if (column >= startColumn && column <= endColumn) {
                return true;
            }
        }

        return false;
    }

    isRenderDiffRangesByRow(row: number, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startRow, endRow } = range;
            if (row >= startRow && row <= endRow) {
                return true;
            }
        }

        return false;
    }
}
