
type UnknownProps = Record<string, any>;
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;
type ConstructorType<T> = OmitType<T, Function>;

type InterpolationFunction = (start: number, end: number, ratio: number) => number;
type LerpFunction<T> = (target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) => void;
type EasingFunction = (amount: number) => number;

type StartType = "start" | "end" | "reverse";

type EasingType = "linear" | "quadraticIn" | "quadraticOut" | "quadraticInOut" | "cubicIn" | "cubicOut" | "cubicInOut" | "quarticIn" | "quarticOut" | "quarticInOut"
    | "quinticIn" | "quinticOut" | "quinticInOut" | "sinusoidalIn" | "sinusoidalOut" | "sinusoidalInOut" | "exponentialIn" | "exponentialOut" | "exponentialInOut"
    | "circularIn" | "circularOut" | "circularInOut" | "elasticIn" | "elasticOut" | "elasticInOut" | "backIn" | "backOut" | "backInOut" | "bounceIn" | "bounceOut" | "bounceInOut";

const TweenEasing = {
    linear: function (amount: number): number {
        return amount;
    },
    quadraticIn: function (amount: number): number {
        return amount * amount;
    },
    quadraticOut: function (amount: number): number {
        return amount * (2 - amount);
    },
    quadraticInOut: function (amount: number): number {
        if ((amount *= 2) < 1)
            return 0.5 * amount * amount;
        return -0.5 * (--amount * (amount - 2) - 1);
    },
    cubicIn: function (amount: number): number {
        return amount * amount * amount;
    },
    cubicOut: function (amount: number): number {
        return --amount * amount * amount + 1;
    },
    cubicInOut: function (amount: number): number {
        if ((amount *= 2) < 1)
            return 0.5 * amount * amount * amount;
        return 0.5 * ((amount -= 2) * amount * amount + 2);
    },
    quarticIn: function (amount: number): number {
        return amount * amount * amount * amount;
    },
    quarticOut: function (amount: number): number {
        return 1 - --amount * amount * amount * amount;
    },
    quarticInOut: function (amount: number): number {
        if ((amount *= 2) < 1)
            return 0.5 * amount * amount * amount * amount;
        return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
    },
    quinticIn: function (amount: number): number {
        return amount * amount * amount * amount * amount;
    },
    quinticOut: function (amount: number): number {
        return --amount * amount * amount * amount * amount + 1;
    },
    quinticInOut: function (amount: number): number {
        if ((amount *= 2) < 1)
            return 0.5 * amount * amount * amount * amount * amount;
        return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
    },
    sinusoidalIn: function (amount: number): number {
        return 1 - Math.cos((amount * Math.PI) / 2);
    },
    sinusoidaOut: function (amount: number): number {
        return Math.sin((amount * Math.PI) / 2);
    },
    sinusoidaInOut: function (amount: number): number {
        return 0.5 * (1 - Math.cos(Math.PI * amount));
    },
    exponentialIn: function (amount: number): number {
        return amount === 0 ? 0 : Math.pow(1024, amount - 1);
    },
    exponentialOut: function (amount: number): number {
        return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
    },
    exponentialInOut: function (amount: number): number {
        if (amount === 0 || amount === 1)
            return amount;
        if ((amount *= 2) < 1)
            return 0.5 * Math.pow(1024, amount - 1);
        return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
    },
    circularIn: function (amount: number): number {
        return 1 - Math.sqrt(1 - amount * amount);
    },
    circularOut: function (amount: number): number {
        return Math.sqrt(1 - --amount * amount);
    },
    circularInOut: function (amount: number): number {
        if ((amount *= 2) < 1)
            return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
        return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
    },
    elasticIn: function (amount: number): number {
        if (amount === 0 || amount === 1)
            return amount;
        return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
    },
    elasticOut: function (amount: number): number {
        if (amount === 0 || amount === 1)
            return amount;
        return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
    },
    elasticInOut: function (amount: number): number {
        if (amount === 0 || amount === 1)
            return amount;
        amount *= 2;
        if (amount < 1)
            return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
        return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
    },
    backIn: function (amount: number): number {
        const s = 1.70158
        return amount * amount * ((s + 1) * amount - s);
    },
    backOut: function (amount: number): number {
        const s = 1.70158
        return --amount * amount * ((s + 1) * amount + s) + 1;
    },
    backInOut: function (amount: number): number {
        const s = 1.70158 * 1.525
        if ((amount *= 2) < 1)
            return 0.5 * (amount * amount * ((s + 1) * amount - s));
        return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
    },
    bounceIn: function (amount: number): number {
        return 1 - TweenEasing.bounceOut(1 - amount);
    },
    bounceOut: function (amount: number): number {
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
    bounceInOut: function (amount: number): number {
        if (amount < 0.5)
            return TweenEasing.bounceIn(amount * 2) * 0.5;
        return TweenEasing.bounceOut(amount * 2 - 1) * 0.5 + 0.5;
    },
};

/**
 * Tween的可选参数
 */
export interface ITweenOption<T> {
    /**
     * 缓动函数，可以使用已有的，也可以传入自定义的函数。
     */
    easing?: EasingType | EasingFunction;

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

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

class CallFunction {
    public constructor(public readonly callback: Function, public readonly thisArg?: any, public readonly argArray?: any[]) { }
    public call(...argArray: any[]): any {
        if (this.argArray && argArray.length > 0) argArray.unshift(...this.argArray);
        return this.callback?.call(this.thisArg, ...argArray);
    }
}

interface Action {
    onInitialize(): void;
    onStart(type: StartType): void;
    onUpdate(deltaTime: number): boolean;
    onCompleted(): void;
    onCleared(): void;
}

abstract class TargetAction<T> implements Action {
    protected valuesStart: ConstructorType<T>;
    protected valuesEnd: ConstructorType<T>;

    public constructor(public readonly target: T, properties: ConstructorType<T>) {
        this.valuesEnd = Object.assign({}, properties);
    }
    public onInitialize(): void {
        if (this.valuesStart == null) {
            this.valuesStart = {};
            this.setupProperties();
        }
    }
    public onStart(type: StartType): void { }
    public abstract onUpdate(deltaTime: number): boolean;
    public onCompleted(): void { }
    public onCleared(): void { }

    protected setupProperties(): void {
        TargetAction.setupProperties(this.target, this.valuesStart, this.valuesEnd, this.setupValueFunction.bind(this));
    }

    protected setupValueFunction(value: number): number {
        return value;
    }

    public static setupProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, call: (value: number) => number): void {
        for (const property in valuesEnd) {
            const startValue = target[property];
            const propType = typeof startValue ?? typeof valuesEnd[property];

            if (propType === 'object') {
                if (valuesStart[property] == null) valuesStart[property] = {};
                TargetAction.setupProperties(startValue, valuesStart[property], valuesEnd[property], call);
            } else if (propType === 'number') {
                valuesStart[property] = call(startValue);
            }
        }
    }

    public static updateProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>, ratio: number, updateProperty: LerpFunction<T>, interpolation: InterpolationFunction): void {
        for (const property in valuesEnd) {
            let start = valuesStart[property] || 0;
            let end = valuesEnd[property];
            const propType = typeof end ?? typeof start;

            if (propType === 'object') {
                TargetAction.updateProperties(target[property], start, end, ratio, updateProperty, interpolation);
                target[property] = target[property]; // assign the object to active event.
            } else if (propType === 'number') {
                updateProperty(target, property, valuesStart, start, end, ratio, interpolation);
            }
        }
    }

    // public static flipProperties<T>(valuesEnd: ConstructorType<T>): void {
    //     for (const property in valuesEnd) {
    //         const propType = typeof valuesEnd[property];

    //         if (propType === 'object') {
    //             TweenAction.flipProperties(valuesEnd[property]);
    //         } else if (propType === 'number') {
    //             valuesEnd[property] = -valuesEnd[property];
    //         }
    //     }
    // }
}

class DelayAction implements Action {
    private elapsedTime: number;

    public constructor(public readonly duration: number) { }

    public onInitialize(): void { }

    public onStart(type: StartType): void {
        switch (type) {
            case "start":
                this.elapsedTime = 0;
                break;
            case "end":
                this.elapsedTime = this.duration;
                break;
            case "reverse":
                if (this.elapsedTime > this.duration)
                    this.elapsedTime = this.duration;
                break;
        }
    }

    public onUpdate(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        return deltaTime < 0 ? this.elapsedTime > 0 : this.elapsedTime < this.duration;
    }

    public onCompleted(): void { }
    public onCleared(): void { }
}

class CallAction extends CallFunction implements Action {

    public onInitialize(): void { }
    public onStart(type: StartType): void { }

    public onUpdate(deltaTime: number): boolean {
        this.call();
        return false;
    }

    public onCompleted(): void { }
    public onCleared(): void { }
}

class TweenSetAction<T> extends TargetAction<T> {
    protected lerpFunction: LerpFunction<T> = this.lerpProperty.bind(this);

    // public onReverse(): void {
    // let temp = this.valuesStart;
    // this.valuesStart = this.valuesEnd;
    // this.valuesEnd = temp;
    // }

    public onUpdate(deltaTime: number): boolean {
        TargetAction.updateProperties(this.target, this.valuesStart, this.valuesEnd, undefined, this.lerpFunction, undefined);
        return false;
    }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        target[property] = end;
    }

    public static updateProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>): void {
        for (const property in valuesEnd) {
            const end = valuesEnd[property];
            const propType = typeof valuesStart[property] ?? typeof end;

            if (propType === 'object') {
                TweenSetAction.updateProperties(target[property], valuesStart, end);
                target[property] = target[property];
            } else {
                target[property] = end;
            }
        }
    }
}

class TweenAction<T> extends TargetAction<T> {
    protected readonly options: Omit<ITweenOption<T>, "easing" | "progress"> = {};
    protected elapsedTime: number;
    protected readonly easing: EasingFunction = TweenEasing.linear;
    protected readonly updateProperty: InterpolationFunction = lerp;
    protected readonly lerpFunction: LerpFunction<T> = this.lerpProperty.bind(this);

    public constructor(target: T, properties: ConstructorType<T>, public readonly duration: number, options?: ITweenOption<T>) {
        super(target, properties);
        if (options != null) {
            Object.assign(this.options, options);
            this.easing = typeof options.easing == "string" ? TweenEasing[options.easing] : typeof options.easing == "function" ? options.easing : TweenEasing.linear;
            this.updateProperty = options.progress ?? lerp;
        }
    }

    public onStart(type: StartType): void {
        switch (type) {
            case "start":
                this.elapsedTime = 0;
                break;
            case "end":
                this.elapsedTime = this.duration;
                break;
            case "reverse":
                if (this.elapsedTime > this.duration)
                    this.elapsedTime = this.duration;
                else if (this.elapsedTime < 0)
                    this.elapsedTime = 0;
                break;
        }
        this.options.onStart?.(this.target);
    }

    // public onReverse(): void {
    //     if (this.elapsedTime > this.duration)
    //         this.elapsedTime = this.duration;
    // }

    public onUpdate(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        this.elapsedTime = Math.min(this.duration, Math.max(0, this.elapsedTime));
        let ratio = this.elapsedTime / this.duration;
        // ratio = ratio > 1 ? 1 : ratio;
        // ratio = Math.min(1, Math.max(0, ratio));
        TweenAction.updateProperties(this.target, this.valuesStart, this.valuesEnd, this.easing(ratio), this.lerpFunction, this.updateProperty);
        this.options.onUpdate?.(this.target, ratio);
        return deltaTime < 0 ? this.elapsedTime > 0 : this.elapsedTime < this.duration;
    }

    public onCompleted(): void {
        this.options.onComplete?.(this.target);
    }

    // public static resetProperties<T>(target: T, valuesStart: ConstructorType<T>, valuesEnd: ConstructorType<T>): void {
    //     for (const property in valuesEnd) {
    //         const startValue = target[property];
    //         const propType = typeof startValue ?? typeof valuesEnd[property];

    //         if (propType === 'object') {
    //             if (valuesStart[property] == null) valuesStart[property] = {};
    //             TweenAction.resetProperties(startValue, valuesStart[property], valuesEnd[property]);
    //         } else if (propType === 'number') {
    //             valuesStart[property] = 0;
    //         }
    //     }
    // }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(start, end, ratio);
        target[property] = finalValue;
    }
}

class TweenByAction<T> extends TweenAction<T> {

    // public onStart(): void {
    //     super.onStart();
    // this.setupProperties();
    // }

    // public onReverse(): void {
    // TargetAction.flipProperties(this.valuesEnd);
    // }

    protected setupValueFunction(value: number): number {
        return 0;
    }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(0, end, ratio);
        target[property] += finalValue - start;
        valuesStart[property] = finalValue;
    }
}

class TweenManager {
    private lastTime: number;
    private tweenList: XTween<UnknownProps>[] = [];
    public updateTweens = (time: number) => {
        this.lastTime = time;
        this.updateTweens = (time: number) => {
            let deltaTime = time - this.lastTime;
            this.update(deltaTime * XTween.TIME_UNIT);
            this.lastTime = time;
        }
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

    public containerTween(tween: XTween<UnknownProps>): boolean {
        return this.tweenList.find(x => x == tween) != null;
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

    private update(deltaTime: number): void {
        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            let tween = this.tweenList[i];
            if (tween == null)
                this.tweenList.splice(i, 1);
            else if (!tween._updateActions(deltaTime)) {
                tween._clear();
                this.tweenList.splice(i, 1);
            }
        }
    }
}

const tweenManager = new TweenManager();

/**
 * version 2.0
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
export class XTween<T extends Object> {
    /** 时间默认单位（秒） */
    public static TIME_UNIT = 0.001;
    private _target: any;
    public get target(): T { return this._target; }
    private readonly actionList: Action[] = [];
    private repeatCount: number = 0;
    private repeatStep: number = 1;
    private indexAction: number;
    private _timeScale: number = 1;
    public get timeScale(): number { return this._timeScale; }
    private onFinallyFunc: CallFunction;
    private _isPlaying = false;
    public get isPlaying() { return this._isPlaying; }
    private _isPaused = false;
    public get isPaused() { return this._isPaused; }
    private isReversed = false;

    /**
     * 创建一个补间动画
     * @param target 要补间的目标对象
     */
    public constructor(target: T, readonly repeatTimes: number = 0, readonly pingPong: boolean = false) {
        this._target = target;
    }

    /**
     * 设置时间缩放，默认是1
     * @param timeScale 时间缩放比例
     */
    public setTimeScale(timeScale: number): this {
        this._timeScale = timeScale;
        return this;
    }

    public to(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    public to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public to<T>(target: T | number, duration: number | ConstructorType<T>, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "object")
            return this._to(this._target = target, duration as number, properties as ConstructorType<T>, options);
        else
            return this._to(this.target as any, target as number, duration as ConstructorType<T>, properties);
    }

    private _to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenAction(target, properties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    public by(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    public by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    /**
      * 对目标对象属性进行补间动作
      * @param target 目标
      * @param duration 补间时长
      * @param properties 属性集
      * @param options 补间可选参数
      * @returns 返回当前补间动画实例
      */
    public by<T>(target: T | number, duration: number | ConstructorType<T>, properties: ConstructorType<T> | ITweenOption<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "object")
            return this._by(this._target = target, duration as number, properties as ConstructorType<T>, options);
        else
            return this._by(this.target as any, target as number, duration as ConstructorType<T>, properties);
    }

    private _by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenByAction(target, properties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    public set(properties: ConstructorType<T>): XTween<T>;
    public set<T>(target: T, properties: ConstructorType<T>): XTween<T>;

    /**
     * 对目录对象属性进行设置
     * @param properties 属性集
     * @returns 返回当前补间动画实例
     */
    public set<T>(target: T | ConstructorType<T>, properties?: ConstructorType<T>): XTween<T> {
        let action: Action;
        if (properties != null)
            action = new TweenSetAction(target, properties);
        else
            action = new TweenSetAction(this.target as any, target);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    /**
     * 对当前补间动作进行延迟
     * @param duration 补间时长
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
    public call<F extends (...args: any) => any>(callback: F, thisArg?: any, ...argArray: Parameters<F>): XTween<T> {
        const action = new CallAction(callback, thisArg, argArray);
        this.actionList.push(action);
        return this;
    }

    /**
     * 在当前补间动作加入一个同时执行的Tween集合
     * @param tweens Tween集合，该集合的Tween的target不需要与当前的target类型相同，每个Tween的target类型都可以不相同。
     * @returns 返回当前补间动画实例
     */
    public add(...tweens: XTween<any>[]): XTween<T> {
        let action = new ParallelAction(tweens);
        this.actionList.push(action);
        return this;
    }

    // /**
    //  * 在当前补间动作加入一个重复执行的Tween
    //  * @param repeatTimes 重复次数，无限次数使用Infinity
    //  * @param pingPong 是否来回缓动
    //  * @param repeatTween 需要被重复执行的Tween
    //  * @returns 返回当前补间动画实例
    //  */
    // public repeat(repeatTimes: number, pingPong: boolean, repeatTween: XTween<any>): XTween<T> {
    //     let action = new RepeatAction(repeatTimes, pingPong, repeatTween);
    //     this.actionList.push(action);
    //     return this;
    // }

    // /**
    //  * 在当前补间动作加入一个无限重复执行的Tween
    //  * @param pingPong 是否来回缓动
    //  * @param repeatTween 需要被重复执行的Tween
    //  * @returns 返回当前补间动画实例
    //  */
    // public repeatForever(pingPong: boolean, repeatTween: XTween<any>): this {
    //     let action = new RepeatAction(Infinity, pingPong, repeatTween);
    //     this.actionList.push(action);
    //     return this;
    // }

    // /**
    //  * 在当前补间动作加入一个Tween
    //  * @param thenTween 要插入执行的Tween
    //  * @returns 返回当前补间动画实例
    //  */
    // public then(thenTween: XTween<any>): this {
    //     let action = new ThenAction(thenTween);
    //     this.actionList.push(action);
    //     return this;
    // }

    /**
     * 开始当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public start(): XTween<T> {
        if (this.isPlaying || this.isPaused) return this;
        return this.restart();
    }

    public restart(): XTween<T> {
        this.isReversed = false;
        this._isPlaying = true;
        this._isPaused = false;
        this._intializeActions();
        this._startActions("start");
        if (!tweenManager.containerTween(this))
            tweenManager.add(this);
        return this;
    }

    public reverse(): XTween<T> {
        // if (this.isReversed) return;
        this._isPlaying = true;
        this._isPaused = false;
        this._reverseTween();
        if (!tweenManager.containerTween(this))
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
    public onFinally<F extends (result: boolean) => void>(callback: F, thisArg?: any): XTween<T> {
        this.onFinallyFunc = new CallFunction(callback, thisArg);
        return this;
    }

    /**
     * 初始化所有Action，这是内部函数，请不要外部调用
     */
    _intializeActions(): void {
        if (this.actionList.length > 0)
            this.actionList[0].onInitialize();
    }

    _startTween(type: StartType): void {
        this.repeatCount = 0;
        this.repeatStep = 1;
        this._startActions(type);
    }

    /**
     * 开始所有Action，这是内部函数，请不要外部调用
     */
    _startActions(type: StartType): void {
        this.indexAction = 0;
        if (this.actionList.length > 0)
            this.actionList[0].onStart(type);
    }

    _reverseTween(): void {
        this.repeatStep = -this.repeatStep;
        this.repeatCount += this.repeatStep;
        // if (this.repeatCount >= this.repeatTimes)
        //     this.repeatCount = this.repeatTimes - 1;
        // else if (this.repeatCount < 0)
        //     this.repeatCount = 0;
        this._reverseActions();
    }

    /**
     * 翻转所有Action，这是内部函数，请不要外部调用
     */
    _reverseActions(): void {
        this.isReversed = !this.isReversed;
        if (this.indexAction >= this.actionList.length)
            this.indexAction = this.actionList.length - 1;
        else if (this.indexAction < 0)
            this.indexAction = 0;
        for (let action of this.actionList)
            action.onStart("reverse");
    }

    /**
     * 更新所有Action。这是内部函数，请不要外部调用
     * @returns 返回true表示继续执行所有Action。false表示不需要再执行了，从父级中删除。
     */
    _updateActions(deltaTime: number): boolean {
        if (this.updateActions(deltaTime)) return true;

        this.repeatCount += this.repeatStep;
        if (!this.checkRepeatCount()) return false;

        if (this.pingPong) {
            this._reverseActions();
        } else {
            this._startActions(this.isReversed ? "end" : "start");
        }
        // this._intializeActions();
        // this._startActions();
        console.log("repeatCount", this.repeatCount, this.repeatStep);
        return true;
    }

    private checkRepeatCount(): boolean {
        return this.repeatStep < 0 ? this.repeatCount >= 0 : this.repeatCount < this.repeatTimes;
    }

    private checkIndexActions(): boolean {
        return this.isReversed ? this.indexAction >= 0 : this.indexAction < this.actionList.length;
    }

    private updateActions(deltaTime: number): boolean {
        if (!this.checkIndexActions()) return false;

        if (this.isReversed) deltaTime = -deltaTime;
        let action = this.actionList[this.indexAction];
        if (action.onUpdate(deltaTime * this.timeScale))
            return true;
        action.onCompleted();

        this.isReversed ? this.indexAction-- : this.indexAction++;
        if (!this.checkIndexActions()) return false;

        let nextAction = this.actionList[this.indexAction];
        nextAction.onInitialize();
        nextAction.onStart("start");
        return true;
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
            this.onFinallyFunc.call(this.checkIndexActions());
            this.onFinallyFunc = null;
        }
    }

    //----------------------------------------------------------------------------------------------------------------------------
    public static to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).to(duration, properties, options);
    }

    public static by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).by(duration, properties, options);
    }

    /**
     * 创建一个重复执行的Tween
     * @param repeatTimes 重复次数，无限次数使用Infinity
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回补间动画实例
     */
    public static repeat<T>(target: T, repeatTimes: number, pingPong?: boolean): XTween<T> {
        return new XTween(target, repeatTimes, pingPong)
    }

    /**
     * 创建一个无限重复执行的Tween
     * @param pingPong 是否来回缓动
     * @param repeatTween 需要被重复执行的Tween
     * @returns 返回补间动画实例
     */
    public static repeatForever<T>(target: T, pingPong?: boolean): XTween<T> {
        return new XTween(target, Infinity, pingPong)
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
     */
    public static updateTweens(time: number = Date.now()): void {
        tweenManager.updateTweens(time);
    }
}

// class ThenAction<T> implements Action<T> {

//     public constructor(readonly tween: XTween<T>) { }

//     public onInitialize(target: T): void {
//         this.tween._intializeActions();
//     }

//     public onStart(target: T): void {
//         this.tween._startActions();
//     }

//     public reverseValues(target: T): void {
//         this.tween._reverseActions();
//     }

//     public onUpdate(target: T, deltaTime: number): boolean {
//         return this.tween._updateActions(deltaTime);
//     }

//     public onCompleted(target: T): void { }

//     public onCleared(): void {
//         this.tween._clear();
//     }
// }

// class SequenceAction<T> implements Action<T> {
//     protected currentIndex: number = 0;

//     public constructor(readonly tweens: XTween<T>[]) { }

//     public onInitialize(target: T): void {
//         this.currentIndex = 0;
//         this.tweens[this.currentIndex]._intializeActions();
//     }

//     public onStart(target: T): void {
//         this.tweens[this.currentIndex]._startActions();
//     }

//     public reverseValues(target: T): void {
//         this.tweens.reverse();
//         for (let tween of this.tweens)
//             tween._reverseActions();
//     }

//     public onUpdate(target: T, deltaTime: number): boolean {
//         if (this.currentIndex < this.tweens.length) {
//             let tween = this.tweens[this.currentIndex];
//             if (!tween._updateActions(deltaTime))
//                 return false;
//             this.currentIndex++;
//             if (this.currentIndex < this.tweens.length) {
//                 let nextTween = this.tweens[this.currentIndex];
//                 nextTween._intializeActions();
//                 nextTween._startActions();
//             }
//         }
//         return this.currentIndex >= this.tweens.length;
//     }

//     public onCompleted(target: T): void { }

//     public onCleared(): void {
//         for (let tween of this.tweens)
//             tween._clear();
//     }
// }

class ParallelAction<T> implements Action {
    protected updateTweens: XTween<T>[];

    public constructor(public readonly tweens: XTween<T>[]) { }

    public onInitialize(): void {
        this.updateTweens = Array.from(this.tweens);
        for (let tween of this.tweens)
            tween._intializeActions();
    }

    public onStart(type: StartType): void {
        for (let tween of this.tweens)
            tween._startTween(type);
    }

    // public onReverse(): void {
    //     for (let tween of this.tweens)
    //         tween._reverseTween();
    // }

    public onUpdate(deltaTime: number): boolean {
        for (let i = this.updateTweens.length - 1; i >= 0; i--) {
            if (!this.updateTweens[i]._updateActions(deltaTime))
                this.updateTweens.splice(i, 1);
        }
        return this.updateTweens.length > 0;
    }

    public onCompleted(): void { }

    public onCleared(): void {
        for (let tween of this.tweens)
            tween._clear();
    }
}

// class RepeatAction<T> implements Action<T> {
//     protected repeatCount: number = 0;

//     public constructor(readonly repeatTimes: number, readonly pingPong: boolean, readonly repeatTween: XTween<T>) {
//         // this.repeatTimes = repeatTimes;
//         // this.pingPong = pingPong;
//         // this.repeatTween = repeatTween;
//     }

//     public onInitialize(target: T): void {
//         this.repeatTween._intializeActions();
//     }

//     public onStart(target: T): void {
//         this.repeatCount = 0;
//         this.repeatTween._startActions();
//     }

//     public reverseValues(target: T): void {
//         this.repeatTween._reverseActions();
//     }

//     public onUpdate(target: T, deltaTime: number): boolean {
//         if (this.repeatTween._updateActions(deltaTime)) {
//             if (this.pingPong)
//                 this.repeatTween._reverseActions();
//             this.repeatTween._intializeActions();
//             this.repeatTween._startActions();
//             this.repeatCount++;
//         }
//         return this.repeatCount >= this.repeatTimes;
//     }

//     public onCompleted(target: T): void { }

//     public onCleared(): void {
//         this.repeatTween._clear();
//     }
// }