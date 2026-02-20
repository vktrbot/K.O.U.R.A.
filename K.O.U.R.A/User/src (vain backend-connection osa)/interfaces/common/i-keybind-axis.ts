export default interface IKeybindAxis {
    readonly positiveKey: string;
    readonly negativeKey: string;
    readonly responsiveness: number;

    // If have enough time for implementing key edit
    setPositiveKey(key: string);
    setNegativeKey(negativeKey: string);
}