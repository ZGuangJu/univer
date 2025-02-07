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

import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import styles from './index.module.less';

export interface IPopupProps {
    children: React.ReactElement;

    /**
     * whether popup is visible
     * @default false
     */
    visible?: boolean;

    /**
     * the offset of popup
     * @default [0, 0]
     */
    offset?: [number, number];
}

export function Popup(props: IPopupProps) {
    const { children, visible = false, offset = [0, 0] } = props;

    const nodeRef = useRef(null);

    const [realoffset, setRealOffset] = useState<[number, number]>(offset);

    useEffect(() => {
        if (!visible) {
            setRealOffset([-9999, -9999]);
            return;
        }

        // edge avoidance
        const [left, top] = offset;
        const { clientWidth, clientHeight } = nodeRef.current!;
        const { innerWidth, innerHeight } = window;
        const x = left + clientWidth > innerWidth ? innerWidth - clientWidth : left;
        const y = top + clientHeight > innerHeight ? innerHeight - clientHeight : top;

        setRealOffset([x, y]);
    }, [offset, visible]);

    function preventDefault(event: React.MouseEvent) {
        event.preventDefault();
    }

    return (
        <CSSTransition
            in={visible}
            nodeRef={nodeRef}
            timeout={300}
            classNames={{
                enter: styles.popupEnter,
                enterActive: styles.popupEnterActive,
                enterDone: styles.popupEnterDone,
                exitActive: styles.popupExit,
                exitDone: styles.popupExitActive,
            }}
        >
            <section
                ref={nodeRef}
                className={styles.popup}
                style={{
                    left: realoffset[0],
                    top: realoffset[1],
                }}
                onContextMenu={preventDefault}
            >
                {children}
            </section>
        </CSSTransition>
    );
}
