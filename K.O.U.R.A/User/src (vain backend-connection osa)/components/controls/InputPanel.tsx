import { useKeybindAxis } from '@/hooks/use-keybind-axis'
import { getMainStore } from '@/store/main-store'
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Package } from 'lucide-react';
import { observer } from 'mobx-react-lite';

const InputPanel = () => {
    const inputStore = getMainStore().inputStore;
    const controlStore = getMainStore().controlStore;

    const [horizontalValue, isHorizontalPositive, isHorizontalNegative] =
        useKeybindAxis(inputStore.horizontalAxis);
    const [verticalValue, isVerticalPositive, isVerticalNegative] =
        useKeybindAxis(inputStore.verticalAxis);
    const [trunkValue, isTrunkPositive, isTrunkNegative] =
        useKeybindAxis(inputStore.trunkAxis);

    useEffect(() => {
        controlStore.setDirection(horizontalValue, verticalValue);
        controlStore.setTrunk(trunkValue);
    }, [horizontalValue, verticalValue, trunkValue]);

    return (
        <Card className="glass-card border-2 border-purple-200 shadow-lg">
            <CardHeader className="pb-3 bg-purple-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-purple-700">
                    <Package className="w-6 h-6 text-purple-600" />
                    Input Control
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <p className={isHorizontalPositive ? "key-pressed" : "key"}>D</p>
                <p className={isHorizontalNegative ? "key-pressed" : "key"}>A</p>
                <p className={isVerticalPositive ? "key-pressed" : "key"}>W</p>
                <p className={isVerticalNegative ? "key-pressed" : "key"}>S</p>
                <p className={isTrunkPositive ? "key-pressed" : "key"}>R</p>
                <p className={isTrunkNegative ? "key-pressed" : "key"}>T</p>
                <p>Horizontal Value: {horizontalValue}</p>
                <p>Vertical Value: {verticalValue}</p>
                <p>Trunk Value: {trunkValue}</p>
            </CardContent>
        </Card>
    )
}

export default observer(InputPanel);
