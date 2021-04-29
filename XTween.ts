
type UnknownProps = Record<string, any>
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;
type ConstructorType<T> = OmitType<T, Function>;

type InterpolationFunction = (start: number, end: number, ratio: number) => number;
type EasingFunction = (amount: number) => number;

/**
 * Tween的可选参数
 */
export interface ITweenOption<T> {
    /**
     * 缓动函数，可以使用已有的，也可以传入自定义的函数。
     */
    easing?: EasingFunction;

    /**
     * 插值函数，参数的意义 start:起始值，end:目标值，ratio:当前进度
     */
    progress?: InterpolationFunction;

    /**
     * 回调，当缓动动作启动时触发。
     */
    onStart?: (target?: T) => void;

    /**
     * 回调，当缓动动作更新时触发。
     */
    onUpdate?: (target?: T, ratio?: number) => void;

    /**
     * 回调，当缓动动作完成时触发。
     */
    onComplete?: (target?: T) => void;
}

interface Action<T> {
    onStart(target: T, resetValue: boolean): void;
    reverseValues(target: T): void;
    onUpdate(target: T, deltaTime: number): boolean;
    onCompleted(target: T): void;
}

class TweenSetAction<T> implements Action<T> {
    private valuesStart: ConstructorType<T>;
    private valuesEnd: ConstructorType<T>;

    public constructor(properties: ConstructorType<T>) {
        this.valuesEnd = Object.assign({}, properties);
    }

    public onStart(target: T, resetValue: boolean): void {
        if (resetValue) {
            this.valuesStart = {};
            TweenSetAction.setupProperties(target, this.valuesStart, this.valuesEnd);
        }
    }

    public reverseValues(target: T): void {
        let temp = this.valuesStart;
        this.valuesStart = this.valuesEnd;
        this.valuesEnd = temp;
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        TweenSetAction.updateProperties(target, this.valuesStart, this.valuesEnd);
        return true;
    }

    public onCompleted(target: T): void { }

    public static setupProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>): void {
        for (const property in valuesEnd) {
            const startValue = target[property];
            const propType = typeof startValue ?? typeof valuesEnd[property];

            if (propType === 'object') {
                if (valuesStart[property] == null) valuesStart[property] = {};
                TweenSetAction.setupProperties(startValue, valuesStart[property], valuesEnd[property]);
            } else {
                valuesStart[property] = startValue;
            }
        }
    }

    public static updateProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>): void {
        for (const property in valuesEnd) {
            const end = valuesEnd[property];
            const propType = typeof valuesStart[property] ?? typeof end;

            if (propType === 'object') {
                TweenSetAction.updateProperties(target[property], valuesStart, end);
            } else {
                target[property] = end;
            }
        }
    }
}

class TweenAction<T> implements Action<T> {
    private valuesStart: ConstructorType<T>;
    private valuesEnd: ConstructorType<T>;
    private readonly duration: number;
    private readonly options: ITweenOption<T> = {};
    private elapsedTime: number;
    private isBy: boolean;

    public constructor(duration: number, isBy: boolean, properties: ConstructorType<T>, options?: ITweenOption<T>) {
        this.duration = duration;
        this.isBy = isBy;
        this.valuesEnd = Object.assign({}, properties);
        Object.assign(this.options, options);
        if (options.easing == null) this.options.easing = XTween.Easing.Linear.None;
        if (options.progress == null) this.options.progress = TweenAction.progress;
    }

    public static progress(start: any, end: any, t: number) {
        return start + (end - start) * t;
    }

    public onStart(target: T, resetValue: boolean): void {
        this.elapsedTime = 0;
        if (resetValue) {
            this.valuesStart = {};
            if (this.options.onStart) this.options.onStart(target);
            TweenAction.setupProperties(target, this.valuesStart, this.valuesEnd, this.isBy);
        }
    }

    public reverseValues(target: T): void {
        let temp = this.valuesStart;
        this.valuesStart = this.valuesEnd;
        this.valuesEnd = temp;
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        let ratio = this.elapsedTime / this.duration;
        ratio = ratio > 1 ? 1 : ratio;
        const value = this.options.easing(ratio);
        TweenAction.updateProperties(target, this.valuesStart, this.valuesEnd, value, this.options.progress);
        if (this.options.onUpdate) this.options.onUpdate(target, ratio);
        return ratio >= 1;
    }

    public onCompleted(target: T): void {
        if (this.options.onComplete) this.options.onComplete(target);
    }

    public static setupProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, isBy: boolean): void {
        for (const property in valuesEnd) {
            const startValue = target[property];
            const propType = typeof startValue ?? typeof valuesEnd[property];

            if (propType === 'number') {
                valuesStart[property] = startValue;
                if (isBy) valuesEnd[property] += startValue;
            } else if (propType === 'object') {
                if (valuesStart[property] == null) valuesStart[property] = {};
                TweenAction.setupProperties(startValue, valuesStart[property], valuesEnd[property], isBy);
            }
        }
    }

    public static updateProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, value: number, interpolation: InterpolationFunction): void {
        for (const property in valuesEnd) {
            const start = valuesStart[property] || 0;
            let end = valuesEnd[property];
            const propType = typeof end ?? typeof start;

            if (propType === 'number') {
                target[property] = interpolation(start, end, value);
            } else if (propType === 'object') {
                TweenAction.updateProperties(target[property], start, end, value, interpolation);
            }
        }
    }
}

class DelayAction<T> implements Action<T> {
    private readonly duration: number;
    private elapsedTime: number;

    public constructor(duration: number) {
        this.duration = duration;
    }

    reverseValues(target: T): void { }

    onStart(target: T, resetValue: boolean): void {
        this.elapsedTime = 0;
    }

    onUpdate(target: T, deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        return this.elapsedTime >= this.duration;
    }

    onCompleted(target: T): void { }
}

class CallAction<T> implements Action<T> {
    private readonly callback: Function;
    private readonly thisArg: any;
    private readonly argArray: any[];

    public constructor(callback: Function, thisArg?: any, argArray?: any[]) {
        this.callback = callback;
        this.thisArg = thisArg;
        this.argArray = argArray;
    }

    reverseValues(target: T): void { }

    onStart(target: T, resetValue: boolean): void { }

    onUpdate(target: T, deltaTime: number): boolean {
        this.callback?.call(this.thisArg, ...this.argArray);
        return true;
    }

    onCompleted(target: T): void { }
}

class TweenManager {
    private lastTime: number;
    private actionGroupList: XTween<UnknownProps>[] = [];

    public add(actionGroup: XTween<UnknownProps>): void {
        this.actionGroupList.push(actionGroup);
    }

    public remove(actionGroup: XTween<UnknownProps>): void {
        let index = this.actionGroupList.indexOf(actionGroup);
        if (index != -1)
            this.actionGroupList.splice(index, 1);
    }

    public removeTarget(target: any): void {
        for (let i = this.actionGroupList.length - 1; i >= 0; i--) {
            if (this.actionGroupList[i].target == target)
                this.actionGroupList.splice(i, 1);
        }
    }

    public containTweens(target: any): boolean {
        for (let i = this.actionGroupList.length - 1; i >= 0; i--) {
            if (this.actionGroupList[i].target == target)
                return true;
        }
        return false;
    }

    public removeAll(): void {
        this.actionGroupList.length = 0;
    }

    public intialize(startTime: number = Date.now()): void {
        this.lastTime = startTime;
    }

    public update(time: number = Date.now()): void {
        let deltaTime = time - this.lastTime;
        this.lastTime = time;
        for (let i = this.actionGroupList.length - 1; i >= 0; i--) {
            let actionGroup = this.actionGroupList[i];
            if (actionGroup._updateActions(deltaTime))
                this.actionGroupList.splice(i, 1);
        }
    }
}

const tweenManager = new TweenManager();

/**
 * 这是一个补间动画
 * 支持对象的number属性
 * 支持自定义插值，默认是线性插值。可以自定义为贝塞尔等。
 * 支持每一个动作进行onStart, onUpdate, onComplete事件回调。
 * 支持泛型参数推导。可以对要补间的动画参数进行语法检查和补全。
 * 支持连续拼接动作
 * 
 * 注意使用前需要初始化一下：
 * @example
 * setInterval(XTween.intialize(), 1);
 * 
 * 使用示例
 * @example
 * xtween(this.installBtn)
 *  .to(1000, { "bottom": 500, "rotation": 360 }, { easing: XTween.Easing.Back.InOut })
 *  .to(1500, { "scaleX": 2 }, {
 *      onUpdate: (target, ratio) => {
 *          console.log("onUpdate 1", target.scaleX, ratio);
 *      },
 *      onComplete: (target) => {
 *          console.log("onComplete 1", target.scaleX);
 *      }
 *  })
 *  .delay(1000)
 *  .repeat(2, xtween(this.installBtn).to(1500, { "alpha": 0 }).to(1500, { "alpha": 1 }))
 *  .sequence(new Tween(this.logo).to(1000, { "top": 100 }), xtween(this.spinModelImage).to(1000, { "centerY": -500 }))
 *  .call(() => {
 *      console.log("Call 1", this.installBtn.scaleX);
 *  })
 *  .to(1500, { "scaleX": 1.0 }, {
 *      onStart: (target) => {
 *          console.log("onStart ", target.scaleX);
 *      },
 *      onUpdate: (target, ratio) => {
 *          console.log("onUpdate ", target.scaleX, ratio);
 *      }
 *  })
 * .set({ visable: false })
 * .start(); 
 */
export class XTween<T> {
    public static Easing = {
        Linear: {
            None: function (amount: number): number {
                return amount;
            },
        },
        Quadratic: {
            In: function (amount: number): number {
                return amount * amount;
            },
            Out: function (amount: number): number {
                return amount * (2 - amount);
            },
            InOut: function (amount: number): number {
                if ((amount *= 2) < 1)
                    return 0.5 * amount * amount;
                return -0.5 * (--amount * (amount - 2) - 1);
            },
        },
        Cubic: {
            In: function (amount: number): number {
                return amount * amount * amount;
            },
            Out: function (amount: number): number {
                return --amount * amount * amount + 1;
            },
            InOut: function (amount: number): number {
                if ((amount *= 2) < 1)
                    return 0.5 * amount * amount * amount;
                return 0.5 * ((amount -= 2) * amount * amount + 2);
            },
        },
        Quartic: {
            In: function (amount: number): number {
                return amount * amount * amount * amount;
            },
            Out: function (amount: number): number {
                return 1 - --amount * amount * amount * amount;
            },
            InOut: function (amount: number): number {
                if ((amount *= 2) < 1)
                    return 0.5 * amount * amount * amount * amount;
                return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
            },
        },
        Quintic: {
            In: function (amount: number): number {
                return amount * amount * amount * amount * amount;
            },
            Out: function (amount: number): number {
                return --amount * amount * amount * amount * amount + 1;
            },
            InOut: function (amount: number): number {
                if ((amount *= 2) < 1)
                    return 0.5 * amount * amount * amount * amount * amount;
                return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
            },
        },
        Sinusoidal: {
            In: function (amount: number): number {
                return 1 - Math.cos((amount * Math.PI) / 2);
            },
            Out: function (amount: number): number {
                return Math.sin((amount * Math.PI) / 2);
            },
            InOut: function (amount: number): number {
                return 0.5 * (1 - Math.cos(Math.PI * amount));
            },
        },
        Exponential: {
            In: function (amount: number): number {
                return amount === 0 ? 0 : Math.pow(1024, amount - 1);
            },
            Out: function (amount: number): number {
                return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
            },
            InOut: function (amount: number): number {
                if (amount === 0 || amount === 1)
                    return amount;

                if ((amount *= 2) < 1)
                    return 0.5 * Math.pow(1024, amount - 1);
                return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
            },
        },
        Circular: {
            In: function (amount: number): number {
                return 1 - Math.sqrt(1 - amount * amount);
            },
            Out: function (amount: number): number {
                return Math.sqrt(1 - --amount * amount);
            },
            InOut: function (amount: number): number {
                if ((amount *= 2) < 1)
                    return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
                return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
            },
        },
        Elastic: {
            In: function (amount: number): number {
                if (amount === 0 || amount === 1)
                    return amount;
                return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
            },
            Out: function (amount: number): number {
                if (amount === 0 || amount === 1)
                    return amount;
                return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
            },
            InOut: function (amount: number): number {
                if (amount === 0 || amount === 1)
                    return amount;

                amount *= 2;
                if (amount < 1)
                    return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
                return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
            },
        },
        Back: {
            In: function (amount: number): number {
                const s = 1.70158
                return amount * amount * ((s + 1) * amount - s);
            },
            Out: function (amount: number): number {
                const s = 1.70158
                return --amount * amount * ((s + 1) * amount + s) + 1;
            },
            InOut: function (amount: number): number {
                const s = 1.70158 * 1.525
                if ((amount *= 2) < 1)
                    return 0.5 * (amount * amount * ((s + 1) * amount - s));
                return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
            },
        },
        Bounce: {
            In: function (amount: number): number {
                return 1 - XTween.Easing.Bounce.Out(1 - amount);
            },
            Out: function (amount: number): number {
                if (amount < 1 / 2.75) {
                    return 7.5625 * amount * amount;
                } else if (amount < 2 / 2.75) {
                    return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
                } else if (amount < 2.5 / 2.75) {
                    return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
                } else {
                    return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
                }
            },
            InOut: function (amount: number): number {
                if (amount < 0.5)
                    return XTween.Easing.Bounce.In(amount * 2) * 0.5;
                return XTween.Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
            },
        },
    }

    public readonly target: T;
    private readonly actionList: Action<T>[] = [];
    private indexAction: number;
    private _isPlaying = false;
    private _isPaused = false;
    public get isPlaying() { return this._isPlaying; }
    public get isPaused() { return this._isPaused; }

    /**
     * 创建一个补间动画
     * @param target 要补间的目标对象
     */
    public constructor(target: T) {
        this.target = target;
    }

    /**
     * 对目标对象属性进行补间动作
     * @param duration 补间时长，单位毫秒
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public to(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): this {
        const action = new TweenAction(duration, false, properties, options || {});
        this.actionList.push(action);
        return this;
    }

    /**
      * 对目标对象属性进行补间动作
      * @param duration 补间时长，单位毫秒
      * @param properties 属性集
      * @param options 补间可选参数
      * @returns 返回当前补间动画实例
      */
    public by(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): this {
        const action = new TweenAction(duration, true, properties, options || {});
        this.actionList.push(action);
        return this;
    }

    /**
     * 对目录对象属性进行设置
     * @param properties 属性集
     * @returns 返回当前补间动画实例
     */
    public set(properties: ConstructorType<T>): this {
        const action = new TweenSetAction(properties);
        this.actionList.push(action);
        return this;
    }

    /**
     * 对当前补间动作进行延迟
     * @param duration 补间时长，单位毫秒
     * @returns 返回当前补间动画实例
     */
    public delay(duration: number): XTween<T> {
        const action = new DelayAction(duration);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作执行函数回调
     * @param callback 函数对象
     * @param thisArg 函数的this对象
     * @param argArray 函数的参数
     * @returns 返回当前补间动画实例
     */
    public call(callback: Function, thisArg?: any, ...argArray: any[]): XTween<T> {
        const action = new CallAction(callback, thisArg, argArray);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个按顺序执行的Tween集合
     * @param tweens Tween集合，该集合的Tween的target不需要与当前的target类型相同，每个Tween的target类型都可以不相同。
     * @returns 返回当前补间动画实例
     */
    public sequence(...tweens: XTween<any>[]): XTween<T> {
        let action = new SequenceAction(...tweens);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个同时执行的Tween集合
     * @param tweens Tween集合，该集合的Tween的target不需要与当前的target类型相同，每个Tween的target类型都可以不相同。
     * @returns 返回当前补间动画实例
     */
    public parallel(...tweens: XTween<any>[]): XTween<T> {
        let action = new ParallelAction(...tweens);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个重复执行的Tween
     * @param repeatTimes 重复次数，无限次数使用Infinity
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回当前补间动画实例
     */
    public repeat(repeatTimes: number, pingPong: boolean, repeatTween: XTween<any>): XTween<T> {
        let action = new RepeatAction(repeatTimes, pingPong, repeatTween);
        this.actionList.push(action);
        return this;
    }

    /**
     * 开始当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public start(): XTween<T> {
        this._isPlaying = true;
        this._isPaused = false;
        this._startActions(true);
        tweenManager.add(this);
        return this;
    }

    /**
     * 暂停当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public pause(): XTween<T> {
        if (!this.isPlaying || this.isPaused) return this;
        this._isPlaying = false;
        this._isPaused = true;
        tweenManager.remove(this);
        return this;
    }

    /**
     * 恢复当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public resume(): XTween<T> {
        if (!this.isPaused || this.isPlaying) return this;
        this._isPlaying = true;
        this._isPaused = false;
        tweenManager.add(this);
        return this;
    }

    /**
     * 停止当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public stop(): XTween<T> {
        this._isPlaying = false;
        this._isPaused = false;
        tweenManager.remove(this);
        return this;
    }

    /**
     * 开始所有Action，这是内部函数，请不要外部调用
     */
    _startActions(resetValue: boolean): void {
        this.indexAction = 0;
        if (this.actionList.length > 0)
            this.actionList[0].onStart(this.target, resetValue);
    }

    /**
     * 翻转所有Action，这是内部函数，请不要外部调用
     */
    _reverseActions(): void {
        this.actionList.reverse();
        for (let action of this.actionList)
            action.reverseValues(this.target);
    }

    /**
     * 更新所有Action。这是内部函数，请不要外部调用
     */
    _updateActions(deltaTime: number): boolean {
        while (this.indexAction < this.actionList.length) {
            let action = this.actionList[this.indexAction];
            if (!action.onUpdate(this.target, deltaTime))
                break;
            action.onCompleted(this.target);
            this.indexAction++;
            let nextAction = this.actionList[this.indexAction];
            if (nextAction != null)
                nextAction.onStart(this.target, true);
        }
        return this.indexAction >= this.actionList.length;
    }

    //----------------------------------------------------------------------------------------------------------------------------
    /**
     * 删除所有的Tween
     */
    public static removeAllTweens(): void {
        return tweenManager.removeAll();
    }

    /**
     * 删除目标身上所有的Tween
     * @param target 目标对象
     */
    public static removeTargetTweens<T>(target: T): void {
        tweenManager.removeTarget(target);
    }

    /**
     * 目标是否包含Tween
     * @param target 目标对象
     */
    public static containTweens<T>(target: T): boolean {
        return tweenManager.containTweens(target);
    }

    /**
     * 初始化Tween，会返回更新函数。
     * @example
     * setInterval(XTween.intialize(), 1);
     * @returns 返回更新函数
     */
    public static intialize(): () => void {
        tweenManager.intialize();
        return XTween.updateTweens;
    }

    /**
     * Tween的更新函数
     * @example
     * setInterval(XTween.intialize(), 1);
     */
    public static updateTweens(): void {
        tweenManager.update();
    }
}

class SequenceAction<T> implements Action<T> {
    protected readonly tweens: XTween<T>[];
    protected currentIndex: number;

    public constructor(...tweens: XTween<T>[]) {
        this.tweens = tweens;
    }

    onStart(target: T, resetValue: boolean): void {
        this.currentIndex = 0;
        for (let tween of this.tweens)
            tween._startActions(resetValue);
    }

    reverseValues(target: T): void {
        this.tweens.reverse();
        for (let tween of this.tweens)
            tween._reverseActions();
    }

    onUpdate(target: T, deltaTime: number): boolean {
        while (this.currentIndex < this.tweens.length) {
            let tween = this.tweens[this.currentIndex];
            if (!tween._updateActions(deltaTime))
                break;
            this.currentIndex++;
        }
        return this.currentIndex >= this.tweens.length;
    }

    onCompleted(target: T): void { }
}

class ParallelAction<T> implements Action<T> {
    protected readonly tweens: XTween<T>[];
    protected updateTweens: XTween<T>[];

    public constructor(...tweens: XTween<T>[]) {
        this.tweens = tweens;
    }

    reverseValues(target: T): void {
        for (let tween of this.tweens)
            tween._reverseActions();
    }

    onStart(target: T, resetValue: boolean): void {
        for (let tween of this.tweens)
            tween._startActions(resetValue);
        this.updateTweens = Array.from(this.tweens);
    }

    onUpdate(target: T, deltaTime: number): boolean {
        for (let i = this.updateTweens.length - 1; i >= 0; i--) {
            if (this.updateTweens[i]._updateActions(deltaTime))
                this.updateTweens.splice(i, 1);
        }
        return this.updateTweens.length == 0;
    }

    onCompleted(target: T): void { }
}

class RepeatAction<T> implements Action<T> {
    protected readonly repeatTimes: number;
    protected readonly repeatTween: XTween<T>;
    protected repeatCount: number = 0;
    protected pingPong: boolean = false;

    public constructor(repeatTimes: number, pingPong: boolean, repeatTween: XTween<T>) {
        this.repeatTimes = repeatTimes;
        this.pingPong = pingPong;
        this.repeatTween = repeatTween;
    }

    reverseValues(target: T): void {
        this.repeatTween._reverseActions();
    }

    onStart(target: T, resetValue: boolean): void {
        this.repeatCount = 0;
        this.repeatTween._startActions(resetValue);
    }

    onUpdate(target: T, deltaTime: number): boolean {
        if (this.repeatTween._updateActions(deltaTime)) {
            if (this.pingPong)
                this.repeatTween._reverseActions();
            this.repeatTween._startActions(false);
            this.repeatCount++;
        }
        return this.repeatCount >= this.repeatTimes;
    }

    onCompleted(target: T): void { }
}

export function xtween<T>(target: T): XTween<T> {
    return new XTween(target);
}