export type EasingFunction = (amount: number) => number;
export default interface ICustomEase {
    readonly easeFunc: EasingFunction;
}