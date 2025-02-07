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

export function remove<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Deduplicate an array.
 * @param arr The array to be dedupe.
 * @returns Return the deduplicated array.
 */
export function dedupe<T>(arr: T[]): T[] {
    const deduplicated = new Set<T>();
    const result: T[] = [];
    for (const element of arr) {
        if (!deduplicated.has(element)) {
            deduplicated.add(element);
            result.push(element);
        }
    }
    return result;
}

export function findLast<T>(arr: T[], callback: (item: T, index: number) => boolean): T | null {
    for (let i = arr.length - 1; i > -1; i--) {
        const item = arr[i];
        if (callback(item, i)) {
            return item;
        }
    }

    return null;
}
