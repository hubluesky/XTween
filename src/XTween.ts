
type UnknownProps = Record<string, any>;
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;
type ConstructorType<T> = OmitType<T, Function>;

type InterpolationFunction = (start: number, end: number, ratio: number) => number;
type LerpFunction<T> = (target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) => void;
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

class CallFunction {
    public constructor(private readonly callback: Function, private readonly thisArg?: any, private readonly argArray?: any[]) { }
    public call(...argArray: any[]): any {
        if (this.argArray) argArray.unshift(...this.argArray);
        return this.callback?.call(this.thisArg, ...argArray);
    }
}

interface Action<T> {
    onInitialize(target: T): void;
    onStart(target: T): void;
    reverseValues(target: T): void;
    onUpdate(target: T, deltaTime: number): boolean;
    onCompleted(target: T): void;
    onCleared(): void;
}

class TweenSetAction<T> implements Action<T> {
    private valuesStart: ConstructorType<T>;
    private valuesEnd: ConstructorType<T>;

    public constructor(properties: ConstructorType<T>) {
        this.valuesEnd = Object.assign({}, properties);
    }

    public onInitialize(target: T): void {
        this.valuesStart = {};
        TweenSetAction.setupProperties(target, this.valuesStart, this.valuesEnd);
    }

    public onStart(target: T): void { }

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

    public onCleared(): void { }

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
    private lerpFunction: LerpFunction<T>;
    private setupValueFunction: (value: number) => number;
    private reverseValuesFunction: (self: TweenAction<T>) => void;

    public constructor(duration: number, isBy: boolean, properties: ConstructorType<T>, options?: ITweenOption<T>) {
        this.duration = duration;
        this.lerpFunction = isBy ? TweenAction.byLerp : TweenAction.toLerp;
        this.setupValueFunction = isBy ? TweenAction.byValue : TweenAction.toValue;
        this.reverseValuesFunction = isBy ? TweenAction.reverseByValues : TweenAction.reverseToValues;
        this.valuesEnd = Object.assign({}, properties);
        Object.assign(this.options, options);
        if (options.easing == null) this.options.easing = XTween.Easing.Linear.None;
        if (options.progress == null) this.options.progress = TweenAction.progress;
    }

    public static progress(start: any, end: any, t: number) {
        return start + (end - start) * t;
    }

    public onInitialize(target: T): void {
        this.valuesStart = {};
        TweenAction.setupProperties(target, this.valuesStart, this.valuesEnd, this.setupValueFunction);
    }

    public onStart(target: T): void {
        this.elapsedTime = 0;
        if (this.options.onStart) this.options.onStart(target);
        if (this.setupValueFunction == TweenAction.byValue) TweenAction.setupProperties(target, this.valuesStart, this.valuesEnd, TweenAction.byValue);
    }

    public reverseValues(target: T): void {
        this.reverseValuesFunction(this);
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        let ratio = this.elapsedTime / this.duration;
        ratio = ratio > 1 ? 1 : ratio;
        const value = this.options.easing(ratio);
        TweenAction.updateProperties(target, this.valuesStart, this.valuesEnd, value, this.lerpFunction, this.options.progress);
        if (this.options.onUpdate) this.options.onUpdate(target, ratio);
        return ratio >= 1;
    }

    public onCompleted(target: T): void {
        if (this.options.onComplete) this.options.onComplete(target);
    }

    public onCleared(): void { }

    public static resetProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>): void {
        for (const property in valuesEnd) {
            const startValue = target[property];
            const propType = typeof startValue ?? typeof valuesEnd[property];

            if (propType === 'object') {
                if (valuesStart[property] == null) valuesStart[property] = {};
                TweenAction.resetProperties(startValue, valuesStart[property], valuesEnd[property]);
            } else if (propType === 'number') {
                valuesStart[property] = 0;
            }
        }
    }

    public static setupProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, call: (value: number) => number): void {
        for (const property in valuesEnd) {
            const startValue = target[property];
            const propType = typeof startValue ?? typeof valuesEnd[property];

            if (propType === 'object') {
                if (valuesStart[property] == null) valuesStart[property] = {};
                TweenAction.setupProperties(startValue, valuesStart[property], valuesEnd[property], call);
            } else if (propType === 'number') {
                valuesStart[property] = call(startValue);
            }
        }
    }

    public static flipProperties<T>(valuesEnd: ConstructorType<T>): void {
        for (const property in valuesEnd) {
            const propType = typeof valuesEnd[property];

            if (propType === 'object') {
                TweenAction.flipProperties(valuesEnd[property]);
            } else if (propType === 'number') {
                valuesEnd[property] = -valuesEnd[property];
            }
        }
    }

    public static updateProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, ratio: number, lerpFunc: LerpFunction<T>, interpolation: InterpolationFunction): void {
        for (const property in valuesEnd) {
            let start = valuesStart[property] || 0;
            let end = valuesEnd[property];
            const propType = typeof end ?? typeof start;

            if (propType === 'object') {
                TweenAction.updateProperties(target[property], start, end, ratio, lerpFunc, interpolation);
            } else if (propType === 'number') {
                lerpFunc(target, property, valuesStart, start, end, ratio, interpolation);
            }
        }
    }

    private static toValue = (value: number): number => value;
    private static byValue = (value: number): number => 0;
    private static reverseByValues<T>(self: TweenAction<T>): void {
        TweenAction.flipProperties(self.valuesEnd);
    }

    private static reverseToValues<T>(self: TweenAction<T>): void {
        let temp = self.valuesStart;
        self.valuesStart = self.valuesEnd;
        self.valuesEnd = temp;
    }
    private static toLerp = function <T>(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(start, end, ratio);
        target[property] = finalValue;
    }
    private static byLerp = function <T>(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(0, end, ratio);
        target[property] += finalValue - start;
        valuesStart[property] = finalValue;
    }
}

class DelayAction<T> implements Action<T> {
    private readonly duration: number;
    private elapsedTime: number;

    public constructor(duration: number) {
        this.duration = duration;
    }

    public onInitialize(target: T): void { }

    public onStart(target: T): void {
        this.elapsedTime = 0;
    }

    public reverseValues(target: T): void { }

    public onUpdate(target: T, deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        return this.elapsedTime >= this.duration;
    }

    public onCompleted(target: T): void { }

    public onCleared(): void { }
}

class CallAction<T> extends CallFunction implements Action<T> {

    public onInitialize(target: T): void { }

    public onStart(target: T): void { }

    public reverseValues(target: T): void { }

    public onUpdate(target: T, deltaTime: number): boolean {
        this.call();
        return true;
    }

    public onCompleted(target: T): void { }

    public onCleared(): void { }
}

class TweenManager {
    private lastTime: number;
    private tweenList: XTween<UnknownProps>[] = [];
    public updateTweens = () => {
        this.lastTime = Date.now() * XTween.TIME_UNIT;
        this.updateTweens = this.update.bind(this);
    };

    public add(tween: XTween<UnknownProps>): void {
        this.tweenList.push(tween);
    }

    public remove(tween: XTween<UnknownProps>): void {
        let index = this.tweenList.indexOf(tween);
        if (index != -1)
            this.tweenList[index] = null;
    }

    public removeTarget(target: any): void {
        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            if (this.tweenList[i]?.target == target) {
                this.tweenList[i]._clear();
                this.tweenList[i] = null;
            }
        }
    }

    public containTweens(target: any): boolean {
        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            if (this.tweenList[i]?.target == target)
                return true;
        }
        return false;
    }

    public removeAll(): void {
        for (let tween of this.tweenList)
            tween?._clear();
        this.tweenList.length = 0;
    }

    private update(time: number = Date.now() * XTween.TIME_UNIT): void {
        let deltaTime = time - this.lastTime;
        this.lastTime = time;

        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            let tween = this.tweenList[i];
            if (tween == null)
                this.tweenList.splice(i, 1);
            else if (tween._updateActions(deltaTime)) {
                tween._clear();
                this.tweenList.splice(i, 1);
            }
        }
    }
}

const tweenManager = new TweenManager();

const TweenEasing = {
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
};

/**
 * version 1.0
 * 这是一个补间动画
 * 支持对象的number属性
 * 支持自定义插值，默认是线性插值。可以自定义为贝塞尔等。
 * 支持每一个动作进行onStart, onUpdate, onComplete事件回调。
 * 支持泛型参数推导。可以对要补间的动画参数进行语法检查和补全。
 * 支持连续拼接动作。
 * 
 * ```
 *  // 注意使用时需要每帧更新一下
 *  setInterval(XTween.updateTweens, 1);
 *
 *  class Target {
 *      visable: boolean = false;
 *      position = { x: 0, y: 0, z: 0 };
 *      rotation: number = 0;
 *      alpha: number = 0;
 *      width: number = 100;
 *      height: number = 200;
 *  }
 *
 *  let target = new Target();
 *  let target2 = new Target();
 *
 *  xtween(target)
 *      .to(1000, { width: 500, rotation: 360 }, { easing: XTween.Easing.Back.Out })
 *      .to(1500, { height: 600 }, {
 *          onComplete: (target) => {
 *              console.log("onComplete 1", target);
 *          }
 *      })
 *      .delay(1000)
 *      .repeat(4, true, xtween(target).to(300, { alpha: 1 }).to(300, { alpha: 0 }))
 *      .sequence(xtween(target).to(1000, { rotation: 100 }), xtween(target2).to(1000, { rotation: 100 }))
 *      .call(() => {
 *          console.log("Call 1", target, target2);
 *      })
 *      .to(1500, { position: { x: 10, y: 20, z: 30 } }, {
 *          onStart: (target) => {
 *              console.log("onStart ", target);
 *          }
 *      })
 *      .set({ visable: false })
 *      .call(() => {
 *          console.log("Call 2", target, target2);
 *      })
 *      .start();
 * ```
 */
export class XTween<T> {
    /** 时间默认单位（秒） */
    public static TIME_UNIT = 0.001;
    public static readonly Easing = TweenEasing;
    public readonly target: T;
    private readonly actionList: Action<T>[] = [];
    private indexAction: number;
    private timeScale: number = 1;
    private onFinallyFunc: CallFunction;
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
     * 设置时间缩放，默认是1
     * @param timeScale 时间缩放比例
     */
    public setTimeScale(timeScale: number): this {
        this.timeScale = timeScale;
        return this;
    }

    /**
     * 对目标对象属性进行补间动作
     * @param duration 补间时长
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
      * @param duration 补间时长
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
     * @param duration 补间时长
     * @returns 返回当前补间动画实例
     */
    public delay(duration: number): this {
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
    public call<F extends (...args: any) => any>(callback: F, thisArg?: any, ...argArray: Parameters<F>): this {
        const action = new CallAction(callback, thisArg, argArray);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个按顺序执行的Tween集合
     * @param tweens Tween集合，该集合的Tween的target不需要与当前的target类型相同，每个Tween的target类型都可以不相同。
     * @returns 返回当前补间动画实例
     */
    public sequence(...tweens: XTween<any>[]): this {
        let action = new SequenceAction(tweens);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个同时执行的Tween集合
     * @param tweens Tween集合，该集合的Tween的target不需要与当前的target类型相同，每个Tween的target类型都可以不相同。
     * @returns 返回当前补间动画实例
     */
    public parallel(...tweens: XTween<any>[]): this {
        let action = new ParallelAction(tweens);
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
    public repeat(repeatTimes: number, pingPong: boolean, repeatTween: XTween<any>): this {
        let action = new RepeatAction(repeatTimes, pingPong, repeatTween);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个无限重复执行的Tween
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回当前补间动画实例
     */
    public repeatForever(pingPong: boolean, repeatTween: XTween<any>): this {
        let action = new RepeatAction(Infinity, pingPong, repeatTween);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个Tween
     * @param thenTween 要插入执行的Tween
     * @returns 返回当前补间动画实例
     */
    public then(thenTween: XTween<any>): this {
        let action = new ThenAction(thenTween);
        this.actionList.push(action);
        return this;
    }

    /**
     * 开始当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public start(): this {
        if (this.isPlaying || this.isPaused) return this;
        this._isPlaying = true;
        this._isPaused = false;
        this._intializeActions();
        this._startActions();
        tweenManager.add(this);
        return this;
    }

    /**
     * 暂停当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public pause(): this {
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
    public resume(): this {
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
    public stop(): this {
        if (!this.isPaused && !this.isPlaying) return this;
        this._isPlaying = false;
        this._isPaused = false;
        tweenManager.remove(this);
        this._clear();
        return this;
    }

    /**
     * 设置tween最终结果回调，如果tween是正常结束，返回参数为true，如果是非正常结束，返回参数为false。
     * @param callback 回调函数
     * @returns 返回当前补间动画实例
     */
    public onFinally<F extends (result: boolean) => void>(callback: F, thisArg?: any): this {
        this.onFinallyFunc = new CallFunction(callback, thisArg);
        return this;
    }

    /**
     * 初始化所有Action，这是内部函数，请不要外部调用
     */
    _intializeActions(): void {
        if (this.actionList.length > 0)
            this.actionList[0].onInitialize(this.target);
    }

    /**
     * 开始所有Action，这是内部函数，请不要外部调用
     */
    _startActions(): void {
        this.indexAction = 0;
        if (this.actionList.length > 0)
            this.actionList[0].onStart(this.target);
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
     * @returns 返回true表示执行所有Action完毕。false表示下一帧继续。
     */
    _updateActions(deltaTime: number): boolean {
        if (this.indexAction < this.actionList.length) {
            let action = this.actionList[this.indexAction];
            if (!action.onUpdate(this.target, deltaTime * this.timeScale))
                return false;
            action.onCompleted(this.target);
            this.indexAction++;
            let nextAction = this.actionList[this.indexAction];
            if (nextAction != null) {
                nextAction.onInitialize(this.target);
                nextAction.onStart(this.target);
            }
        }
        return this.indexAction >= this.actionList.length;
    }

    /**
     * 清理tween状态。这是内部函数，请不要外部调用
     */
    _clear(): void {
        for (let action of this.actionList)
            action.onCleared();
        this._isPlaying = false;
        this._isPaused = false;
        if (this.onFinallyFunc != null) {
            this.onFinallyFunc.call(this.indexAction >= this.actionList.length);
            this.onFinallyFunc = null;
        }
    }

    //----------------------------------------------------------------------------------------------------------------------------
    /**
     * 创建一个重复执行的Tween
     * @param repeatTimes 重复次数，无限次数使用Infinity
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回补间动画实例
     */
    public static repeat<T>(repeatTimes: number, pingPong: boolean, repeatTween: XTween<T>): XTween<T> {
        return new XTween(repeatTween.target).repeat(repeatTimes, pingPong, repeatTween);
    }

    /**
     * 创建一个无限重复执行的Tween
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回补间动画实例
     */
    public static repeatForever<T>(pingPong: boolean, repeatTween: XTween<T>): XTween<T> {
        return new XTween(repeatTween.target).repeatForever(pingPong, repeatTween);
    }

    /**
     * 创建一个按顺序执行的Tween集合
     * @param tweens Tween集合，每个Tween的target类型都可以不相同。
     * @returns 返回补间动画实例
     */
    public static sequence(...tweens: XTween<any>[]): XTween<any> {
        return new XTween({}).sequence(...tweens);
    }

    /**
     * 创建一个同时执行的Tween集合
     * @param tweens Tween集合，每个Tween的target类型都可以不相同。
     * @returns 返回补间动画实例
     */
    public static parallel(...tweens: XTween<any>[]): XTween<any> {
        return new XTween({}).parallel(...tweens);
    }

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
     * Tween的更新函数
     * @example
     * setInterval(XTween.updateTweens, 1);
     */
    public static updateTweens(): void {
        tweenManager.updateTweens();
    }
}

class ThenAction<T> implements Action<T> {

    public constructor(readonly tween: XTween<T>) { }

    public onInitialize(target: T): void {
        this.tween._intializeActions();
    }

    public onStart(target: T): void {
        this.tween._startActions();
    }

    public reverseValues(target: T): void {
        this.tween._reverseActions();
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        return this.tween._updateActions(deltaTime);
    }

    public onCompleted(target: T): void { }

    public onCleared(): void {
        this.tween._clear();
    }
}

class SequenceAction<T> implements Action<T> {
    protected currentIndex: number = 0;

    public constructor(readonly tweens: XTween<T>[]) { }

    public onInitialize(target: T): void {
        let tween = this.tweens[this.currentIndex];
        tween._intializeActions();
    }

    public onStart(target: T): void {
        this.currentIndex = 0;
        let tween = this.tweens[this.currentIndex];
        tween._startActions();
    }

    public reverseValues(target: T): void {
        this.tweens.reverse();
        for (let tween of this.tweens)
            tween._reverseActions();
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        if (this.currentIndex < this.tweens.length) {
            let tween = this.tweens[this.currentIndex];
            if (!tween._updateActions(deltaTime))
                return false;
            this.currentIndex++;
            if (this.currentIndex < this.tweens.length) {
                let nextTween = this.tweens[this.currentIndex];
                nextTween._intializeActions();
                nextTween._startActions();
            }
        }
        return this.currentIndex >= this.tweens.length;
    }

    public onCompleted(target: T): void { }

    public onCleared(): void {
        for (let tween of this.tweens)
            tween._clear();
    }
}

class ParallelAction<T> implements Action<T> {
    protected updateTweens: XTween<T>[];

    public constructor(readonly tweens: XTween<T>[]) { }

    public onInitialize(target: T): void {
        this.updateTweens = Array.from(this.tweens);
        for (let tween of this.tweens)
            tween._intializeActions();
    }

    public onStart(target: T): void {
        for (let tween of this.tweens)
            tween._startActions();
    }

    public reverseValues(target: T): void {
        for (let tween of this.tweens)
            tween._reverseActions();
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        for (let i = this.updateTweens.length - 1; i >= 0; i--) {
            if (this.updateTweens[i]._updateActions(deltaTime))
                this.updateTweens.splice(i, 1);
        }
        return this.updateTweens.length == 0;
    }

    public onCompleted(target: T): void { }

    public onCleared(): void {
        for (let tween of this.tweens)
            tween._clear();
    }
}

class RepeatAction<T> implements Action<T> {
    protected repeatCount: number = 0;

    public constructor(readonly repeatTimes: number, readonly pingPong: boolean, readonly repeatTween: XTween<T>) {
        this.repeatTimes = repeatTimes;
        this.pingPong = pingPong;
        this.repeatTween = repeatTween;
    }

    public onInitialize(target: T): void {
        this.repeatTween._intializeActions();
    }

    public onStart(target: T): void {
        this.repeatCount = 0;
        this.repeatTween._startActions();
    }

    public reverseValues(target: T): void {
        this.repeatTween._reverseActions();
    }

    public onUpdate(target: T, deltaTime: number): boolean {
        if (this.repeatTween._updateActions(deltaTime)) {
            if (this.pingPong)
                this.repeatTween._reverseActions();
            this.repeatTween._startActions();
            this.repeatCount++;
        }
        return this.repeatCount >= this.repeatTimes;
    }

    public onCompleted(target: T): void { }

    public onCleared(): void {
        this.repeatTween._clear();
    }
}

export function xtween<T>(target: T): XTween<T> {
    return new XTween(target);
}