import type { IMutation, IWorksheetData } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

/** @deprecated */
export interface ISetWorksheetConfigMutationParams {
    workbookId: string;
    worksheetId: string;
    config: IWorksheetData;
}

/** @deprecated */
export const SetWorksheetConfigUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetConfigMutationParams
): ISetWorksheetConfigMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId)!;
    const config = Tools.deepClone(worksheet.getConfig());

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        config,
    };
};

/** @deprecated */
export const SetWorksheetConfigMutation: IMutation<ISetWorksheetConfigMutationParams> = {
    id: 'sheet.mutation.set-worksheet-config',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        // TODO: setConfig is going to be deprecated
        // worksheet.setConfig(params.config);

        return true;
    },
};