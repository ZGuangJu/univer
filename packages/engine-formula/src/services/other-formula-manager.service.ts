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

import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { IFormulaDataItem, IOtherFormulaData } from '../basics/common';

export interface IOtherFormulaManagerSearchParam {
    unitId: string;
    subComponentId: string;
    formulaId: string;
}

export interface IOtherFormulaManagerInsertParam extends IOtherFormulaManagerSearchParam {
    item: IFormulaDataItem;
}

export interface IOtherFormulaManagerService {
    dispose(): void;

    remove(searchParam: IOtherFormulaManagerSearchParam): void;

    get(searchParam: IOtherFormulaManagerSearchParam): Nullable<IFormulaDataItem>;

    has(searchParam: IOtherFormulaManagerSearchParam): boolean;

    register(insertParam: IOtherFormulaManagerInsertParam): void;

    getOtherFormulaData(): IOtherFormulaData;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class OtherFormulaManagerService extends Disposable implements IOtherFormulaManagerService {
    private _otherFormulaData: IOtherFormulaData = {};

    override dispose(): void {
        this._otherFormulaData = {};
    }

    remove(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        delete this._otherFormulaData?.[unitId]?.[subComponentId]?.[formulaId];
    }

    get(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subComponentId]?.[formulaId];
    }

    has(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subComponentId]?.[formulaId] != null;
    }

    register(insertParam: IOtherFormulaManagerInsertParam) {
        const { unitId, subComponentId, formulaId, item } = insertParam;
        if (this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }

        if (this._otherFormulaData[unitId][subComponentId]) {
            this._otherFormulaData[unitId][subComponentId] = {};
        }

        this._otherFormulaData[unitId][subComponentId][formulaId] = item;
    }

    getOtherFormulaData() {
        return this._otherFormulaData;
    }
}

export const IOtherFormulaManagerService = createIdentifier<OtherFormulaManagerService>(
    'univer.formula.other-formula-manager.service'
);
