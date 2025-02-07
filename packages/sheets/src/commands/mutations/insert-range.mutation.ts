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

import type { IMutation, IObjectMatrixPrimitiveType, IRange, ObjectMatrix } from '@univerjs/core';
import { CommandType, Dimension, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
} from '../../basics/interfaces/mutation-interface';

/**
 * Generate undo mutation of a `InsertRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertRangeMutationParams} params - do mutation params
 * @returns {IDeleteRangeMutationParams} undo mutation params
 */
export const InsertRangeUndoMutationFactory = (
    accessor: IAccessor,
    params: IInsertRangeMutationParams
): IDeleteRangeMutationParams => ({
    unitId: params.unitId,
    subUnitId: params.subUnitId,
    range: params.range,
    shiftDimension: params.shiftDimension,
});

export const InsertRangeMutation: IMutation<IInsertRangeMutationParams, boolean> = {
    id: 'sheet.mutation.insert-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, range, cellValue, shiftDimension } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getLastRowWithContent();
        const lastEndColumn = worksheet.getLastColumnWithContent();

        handleInsertRangeMutation(cellMatrix, range, lastEndRow, lastEndColumn, shiftDimension, cellValue);

        return true;
    },
};

export function handleInsertRangeMutation<T>(
    cellMatrix: ObjectMatrix<T>,
    range: IRange,
    lastEndRow: number,
    lastEndColumn: number,
    shiftDimension: Dimension,
    cellValue?: IObjectMatrixPrimitiveType<T>
) {
    const { startRow, endRow, startColumn, endColumn } = range;
    if (shiftDimension === Dimension.ROWS) {
        const rows = endRow - startRow + 1;
        // build new data
        for (let r = lastEndRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                // get value blow current range

                const value = cellMatrix.getValue(r, c);
                if (value == null) {
                    cellMatrix.realDeleteValue(r + rows, c);
                } else {
                    cellMatrix.setValue(r + rows, c, value);
                }
            }
        }
        // insert cell value from user
        for (let r = endRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (cellValue && cellValue[r] && cellValue[r][c]) {
                    cellMatrix.setValue(r, c, cellValue[r][c]);
                } else {
                    cellMatrix.realDeleteValue(r, c);
                }
            }
        }
    } else if (shiftDimension === Dimension.COLUMNS) {
        const columns = endColumn - startColumn + 1;
        for (let r = startRow; r <= endRow; r++) {
            for (let c = lastEndColumn; c >= startColumn; c--) {
                // get value blow current range
                const value = cellMatrix.getValue(r, c);

                if (value == null) {
                    cellMatrix.realDeleteValue(r, c + columns);
                } else {
                    cellMatrix.setValue(r, c + columns, value);
                }
            }
        }
        // insert cell value from user
        for (let r = startRow; r <= endRow; r++) {
            for (let c = endColumn; c >= startColumn; c--) {
                if (cellValue && cellValue[r] && cellValue[r][c]) {
                    cellMatrix.setValue(r, c, cellValue[r][c]);
                } else {
                    cellMatrix.realDeleteValue(r, c);
                }
            }
        }
    }
}
