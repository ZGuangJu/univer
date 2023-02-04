import { BaseMenuItem, BaseSelectChildrenProps } from '@univerjs/base-ui';
import { SheetUIPlugin } from '..';
import { RightMenu } from '../View';

export interface CustomLabelOptions extends BaseSelectChildrenProps {
    locale?: string;
}

interface CustomLabelProps {
    prefix?: string;
    suffix?: string;
    prefixLocale?: string[] | string;
    suffixLocale?: string[] | string;
    options?: CustomLabelOptions[];
    locale?: string;
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface RightMenuProps extends BaseMenuItem {
    locale?: string[];
    customLabel?: {
        name: string;
        props?: CustomLabelProps;
    };
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
}

export class RightMenuController {
    private _plugin: SheetUIPlugin;

    private _rightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._menuList = [
            {
                locale: ['rightClick.insert', 'rightClick.row'],
                onClick: () => {},
                show: this._currentConfig.InsertRow,
            },
        ];

        this._initialize();
    }

    private _initialize() {
        setTimeout(() => {
            this._plugin
                .getUniverContainerController()
                .getContentRef()
                .current?.addEventListener('click', (e) => {
                    this._rightMenu.handleContextMenu(e);
                });
        }, 1000);
    }

    // 获取RightMenu组件
    getComponent = (ref: RightMenu) => {
        this._rightMenu = ref;
        this.setMenuList();
    };

    // 刷新
    setMenuList() {
        const locale = this._plugin.getLocale();
        const menuList = resetDataLabel(this._menuList, locale);
        this._rightMenu?.setMenuList(menuList);
    }
}