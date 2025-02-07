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

export default {
    CELL: {
        description: `Returns information about the formatting, location, or contents of a cell`,
        abstract: `Returns information about the formatting, location, or contents of a cell`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/cell-function-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ERROR_TYPE: {
        description: `Returns a number corresponding to an error type`,
        abstract: `Returns a number corresponding to an error type`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/error-type-function-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INFO: {
        description: `Returns information about the current operating environment`,
        abstract: `Returns information about the current operating environment`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/info-function-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISBLANK: {
        description: `Returns TRUE if the value is blank`,
        abstract: `Returns TRUE if the value is blank`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISERR: {
        description: `Returns TRUE if the value is any error value except #N/A`,
        abstract: `Returns TRUE if the value is any error value except #N/A`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISERROR: {
        description: `Returns TRUE if the value is any error value`,
        abstract: `Returns TRUE if the value is any error value`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISEVEN: {
        description: `Returns TRUE if the number is even`,
        abstract: `Returns TRUE if the number is even`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/iseven-function-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISFORMULA: {
        description: `Returns TRUE if there is a reference to a cell that contains a formula`,
        abstract: `Returns TRUE if there is a reference to a cell that contains a formula`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/isformula-function-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISLOGICAL: {
        description: `Returns TRUE if the value is a logical value`,
        abstract: `Returns TRUE if the value is a logical value`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISNA: {
        description: `Returns TRUE if the value is the #N/A error value`,
        abstract: `Returns TRUE if the value is the #N/A error value`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISNONTEXT: {
        description: `Returns TRUE if the value is not text`,
        abstract: `Returns TRUE if the value is not text`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISNUMBER: {
        description: `Returns TRUE if the value is a number`,
        abstract: `Returns TRUE if the value is a number`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISODD: {
        description: `Returns TRUE if the number is odd`,
        abstract: `Returns TRUE if the number is odd`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISOMITTED: {
        description: `Checks whether the value in a&nbsp;LAMBDA&nbsp;is missing and returns TRUE or FALSE`,
        abstract: `Checks whether the value in a&nbsp;LAMBDA&nbsp;is missing and returns TRUE or FALSE`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/isomitted-function-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISREF: {
        description: `Returns TRUE if the value is a reference`,
        abstract: `Returns TRUE if the value is a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISTEXT: {
        description: `Returns TRUE if the value is text`,
        abstract: `Returns TRUE if the value is text`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    N: {
        description: `Returns a value converted to a number`,
        abstract: `Returns a value converted to a number`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/n-function-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NA: {
        description: `Returns the error value #N/A`,
        abstract: `Returns the error value #N/A`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/na-function-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SHEET: {
        description: `Returns the sheet number of the referenced sheet`,
        abstract: `Returns the sheet number of the referenced sheet`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/sheet-function-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SHEETS: {
        description: `Returns the number of sheets in a reference`,
        abstract: `Returns the number of sheets in a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/sheets-function-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TYPE: {
        description: `Returns a number indicating the data type of a value`,
        abstract: `Returns a number indicating the data type of a value`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/type-function-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
