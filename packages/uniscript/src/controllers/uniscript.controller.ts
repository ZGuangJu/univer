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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { ScriptPanelComponentName, ToggleScriptPanelOperation } from '../commands/operations/panel.operation';
import { ScriptEditorPanel } from '../views/components/ScriptEditorPanel';
import { UniscriptMenuItemFactory } from './menu';

@OnLifecycle(LifecycleStages.Steady, UniscriptController)
export class UniscriptController extends Disposable {
    constructor(
        @IMenuService menuService: IMenuService,
        @ICommandService commandService: ICommandService,
        @Inject(ComponentManager) componentManager: ComponentManager
    ) {
        super();

        this.disposeWithMe(menuService.addMenuItem(UniscriptMenuItemFactory()));
        this.disposeWithMe(componentManager.register(ScriptPanelComponentName, ScriptEditorPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleScriptPanelOperation));
    }
}
