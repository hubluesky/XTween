
type UnknownProps = Record<string, any>;
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;
type ConstructorType<T> = OmitType<T, Function>;

type InterpolationFunction = (start: number, end: number, ratio: number) => number;
type LerpFunction<T> = (target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) => void;
type EasingFunction = (amount: number) => number;

type TimeAxis = "forward" | "inverse";

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
    onInit?(type: TimeAxis): void;
    onStart?(type: TimeAxis): void;
    onUpdate(deltaTime: number): boolean;
    onCompleted?(): void;
    onCleared?(): void;
}

class DelayAction implements Action {
    private elapsedTime: number;

    public constructor(public readonly duration: number) { }

    public onInit(type: TimeAxis): void {
        switch (type) {
            case "forward":
                this.elapsedTime = 0;
                break;
            case "inverse":
                this.elapsedTime = this.duration;
                break;
        }
    }

    public onUpdate(deltaTime: number): boolean {
        let result = deltaTime < 0 ? this.elapsedTime > 0 : this.elapsedTime < this.duration;
        this.elapsedTime += deltaTime;
        return result;
    }
}

class CallAction extends CallFunction implements Action {

    public onUpdate(deltaTime: number): boolean {
        this.call();
        return false;
    }
}

abstract class TargetAction<T> implements Action {
    protected valuesStart: ConstructorType<T>;
    protected valuesEnd: ConstructorType<T>;

    public constructor(public readonly target: T, properties: ConstructorType<T>) {
        this.valuesEnd = Object.assign({}, properties);
    }

    protected onInitialize(): void {
        this.valuesStart = {};
        this.setupProperties();
    }

    public onStart(type: TimeAxis): void {
        if (this.valuesStart == null)
            this.onInitialize();
    }
    public abstract onUpdate(deltaTime: number): boolean;

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
}

class TweenSetAction<T> extends TargetAction<T> {
    protected lerpFunction: LerpFunction<T> = this.lerpProperty.bind(this);

    public onUpdate(deltaTime: number): boolean {
        TargetAction.updateProperties(this.target, this.valuesStart, this.valuesEnd, deltaTime, this.lerpFunction, undefined);
        return false;
    }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        target[property] = ratio < 0 ? start : end;
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

    public onInit(type: TimeAxis): void {
        switch (type) {
            case "forward":
                this.elapsedTime = 0;
                break;
            case "inverse":
                this.elapsedTime = this.duration;
                break;
        }
    }

    public onStart(type: TimeAxis): void {
        super.onStart(type);
        this.options.onStart?.(this.target);
    }

    public onUpdate(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        this.elapsedTime = Math.min(this.duration, Math.max(0, this.elapsedTime));
        let ratio = this.elapsedTime / this.duration;
        TweenAction.updateProperties(this.target, this.valuesStart, this.valuesEnd, this.easing(ratio), this.lerpFunction, this.updateProperty);
        this.options.onUpdate?.(this.target, ratio);
        return deltaTime < 0 ? this.elapsedTime > 0 : this.elapsedTime < this.duration;
    }

    public onCompleted(): void {
        this.options.onComplete?.(this.target);
    }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(start, end, ratio);
        target[property] = finalValue;
    }
}

class TweenByAction<T> extends TweenAction<T> {

    protected setupValueFunction(value: number): number {
        return 0;
    }

    protected lerpProperty(target: T, property: string, valuesStart: ConstructorType<T>, start: number, end: number, ratio: number, interpolation: InterpolationFunction) {
        let finalValue = interpolation(0, end, ratio);
        target[property] += finalValue - start;
        valuesStart[property] = finalValue;
    }
}

class TweenFromAction<T> extends TweenAction<T> {

    protected onInitialize(): void {
        super.onInitialize();
        let valuesTemp = this.valuesStart;
        this.valuesStart = this.valuesEnd;
        this.valuesEnd = valuesTemp;
    }
}

class TweenFromToAction<T> extends TweenAction<T> {

    public constructor(target: T, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T>, duration: number, options?: ITweenOption<T>) {
        super(target, toProperties, duration, options);
        this.valuesStart = Object.assign({}, fromProperties);
    }
}

class ParallelAction<T> implements Action {
    protected updateTweens: XTween<T>[];

    public constructor(public readonly tweens: XTween<T>[]) { }

    public onInit(type: TimeAxis): void {
        for (let tween of this.tweens)
            tween._onInit(type);
    }

    public onStart(type: TimeAxis): void {
        this.updateTweens = Array.from(this.tweens);
        for (let tween of this.tweens)
            tween._onStart(type);
    }

    public onUpdate(deltaTime: number): boolean {
        deltaTime = Math.abs(deltaTime);
        for (let i = this.updateTweens.length - 1; i >= 0; i--) {
            if (!this.updateTweens[i]._updateTween(deltaTime))
                this.updateTweens.splice(i, 1);
        }
        return this.updateTweens.length > 0;
    }

    public onCleared(): void {
        for (let tween of this.tweens)
            tween._clear();
    }
}

class TweenManager {
    private lastTime: number;
    private readonly tweenList: XTween<UnknownProps>[] = [];
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

    public removeTag(tag: any): void {
        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            if (this.tweenList[i]?.tag == tag) {
                this.tweenList[i]._clear();
                this.tweenList[i] = null;
            }
        }
    }

    public containerTween(tween: XTween<UnknownProps>): boolean {
        return this.tweenList.find(x => x == tween) != null;
    }

    public containTweens(tag: any): boolean {
        for (let i = this.tweenList.length - 1; i >= 0; i--) {
            if (this.tweenList[i]?.tag == tag)
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
            else if (!tween._updateTween(deltaTime)) {
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
 */
export class XTween<T extends Object> {
    /** 时间默认单位（秒） */
    public static TIME_UNIT = 0.001;
    public static readonly Easing = TweenEasing;
    private taget: any;

    private readonly actionList: Action[] = [];
    private onFinallyFunc: CallFunction;
    private repeatCount: number = 0;
    private repeatStep: number = 1;
    private indexAction: number = 0;
    private timeAxis: TimeAxis;

    private _tag: any;
    /** tween标识 */
    public get tag(): T { return this._tag; }
    private _timeScale: number = 1;
    /** 当前tween的时间缩放值 */
    public get timeScale(): number { return this._timeScale; }
    private _isPlaying = false;
    /** 当前tween是否在运行中 */
    public get isPlaying() { return this._isPlaying; }
    private _isPaused = false;
    /** 当前tween是否被暂停 */
    public get isPaused() { return this._isPaused; }

    /**
     * 创建一个补间动画
     * @param target 要补间的目标对象，也是默认为此tween的tag，如果想自定义tag，请调用{@link setTag}函数
     * @param repeatTimes 重复次数，最小值为1，如果是无限重复，请使用Infinity
     * @param pingPong 重复使用pingPong模式，只在repeatTimes>0时有效
     */
    public constructor(target: T, readonly repeatTimes: number = 1, readonly pingPong: boolean = false) {
        this.repeatTimes = Math.max(1, this.repeatTimes);
        this._tag = this.taget = target;
    }

    /**
     * 设置tween标识，以方便{@link XTween.removeTagTweens}时使用
     * @param tag 标识符号
     * @returns 返回当前补间动画实例
     */
    public setTag(tag: any): this {
        this._tag = tag;
        return this;
    }

    /**
     * 设置时间缩放，默认是1
     * @param timeScale 时间缩放比例
     * @returns 返回当前补间动画实例
     */
    public setTimeScale(timeScale: number): this {
        this._timeScale = timeScale;
        return this;
    }

    /**
     * 对目标对象属性进行补间动作
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public to(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    public to<T>(target: T | number, duration: number | ConstructorType<T>, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "number")
            return this._to(this.taget, target as number, duration as ConstructorType<T>, properties);
        else
            return this._to(this.taget = target, duration as number, properties as ConstructorType<T>, options);
    }

    private _to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenAction(target, properties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    /**
     * 对目标对象属性进行补间动作
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public from(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public from<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    public from<T>(target: T | number, duration: number | ConstructorType<T>, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "number")
            return this._from(this.taget, target as number, duration as ConstructorType<T>, properties);
        else
            return this._from(this.taget = target, duration as number, properties as ConstructorType<T>, options);
    }

    private _from<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenFromAction(target, properties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    /**
     * 对目标对象属性进行补间动作
     * @param duration 补间时长
     * @param fromProperties 起始属性集
     * @param toProperties 终止属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public fromTo(duration: number, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param fromProperties 起始属性集
     * @param toProperties 终止属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public fromTo<T extends Object>(target: T, duration: number, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    public fromTo<T>(target: T | number, duration: number | ConstructorType<T>, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T> | ITweenOption<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "number")
            return this._fromTo(this.taget, target, duration as ConstructorType<T>, fromProperties, toProperties);
        else
            return this._fromTo(this.taget = target, duration as number, fromProperties, toProperties as ConstructorType<T>, options);
    }

    private _fromTo<T extends Object>(target: T, duration: number, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenFromToAction(target, fromProperties, toProperties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    /**
      * 对目标对象属性进行补间动作
      * @param duration 补间时长
      * @param properties 属性集
      * @param options 补间可选参数
      * @returns 返回当前补间动画实例
      */
    public by(duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;
    /**
      * 对目标对象属性进行补间动作
      * @param target 目标
      * @param duration 补间时长
      * @param properties 属性集
      * @param options 补间可选参数
      * @returns 返回当前补间动画实例
      */
    public by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T>;

    public by<T, P extends ConstructorType<T>>(target: T | number, duration: number | P, properties: P | ITweenOption<T>, options?: ITweenOption<T>): XTween<T> {
        if (typeof target === "number")
            return this._by(this.taget, target, duration as ConstructorType<T>, properties);
        else
            return this._by(this.taget = target, duration as number, properties as ConstructorType<T>, options);
    }

    private _by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        const action = new TweenByAction(target, properties, duration, options);
        this.actionList.push(action);
        return this as unknown as XTween<T>;
    }

    /**
     * 对目录对象属性进行设置
     * @param properties 属性集
     * @returns 返回当前补间动画实例
     */
    public set(properties: ConstructorType<T>): XTween<T>;
    /**
     * 对目录对象属性进行设置
     * @param target 目标
     * @param properties 属性集
     * @returns 返回当前补间动画实例
     */
    public set<T>(target: T, properties: ConstructorType<T>): XTween<T>;

    public set<T>(target: T | ConstructorType<T>, properties?: ConstructorType<T>): XTween<T> {
        let action: Action;
        if (properties != null)
            action = new TweenSetAction(target, properties);
        else
            action = new TweenSetAction(this.taget, target);
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

    /**
     * 开始当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public play(): XTween<T> {
        if (this.isPlaying || this.isPaused) return this;
        return this.replay();
    }

    /**
     * 重新开始当前Tween的所有动作
     * @returns 返回当前补间动画实例
     */
    public replay(): XTween<T> {
        if (this.actionList.length == 0) {
            this._clear();
        } else {
            this._isPlaying = true;
            this._isPaused = false;
            this._onInit("forward");
            this._onStart("forward");
            if (!tweenManager.containerTween(this))
                tweenManager.add(this);
        }
        return this;
    }

    /**
     * 对于当前播放过的运作进行反向播放,相当于视频播放一段时间后，然后倒着播放，可以在任意时刻倒放。
     * 此函数必须先start后才可以正常使用，start后，可以反复多次调整。
     * @returns 返回当前补间动画实例
     */
    public reverse(): XTween<T> {
        if (this.actionList.length == 0) {
            this._clear();
        } else {
            this._isPlaying = true;
            this._isPaused = false;
            this._onStart(this.timeAxis == "forward" ? "inverse" : "forward");
            if (!tweenManager.containerTween(this))
                tweenManager.add(this);
        }
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
     * 初始化Tween，这是内部函数，请不要外部调用
     */
    _onInit(type: TimeAxis): void {
        this.timeAxis = type;
        this.repeatCount = type == "forward" ? 0 : this.repeatTimes - 1;
        this.resetActions(type);
    }

    private resetActions(type: TimeAxis): void {
        this.indexAction = type == "forward" ? 0 : this.actionList.length - 1;
        for (let action of this.actionList)
            action.onInit?.(type);
    }

    /**
     * 开始Tween，这是内部函数，请不要外部调用
     */
    _onStart(type: TimeAxis): void {
        this.repeatStep = type == "forward" ? +1 : -1;
        this._startActions(type);
    }

    /**
     * 开始Action，这是内部函数，请不要外部调用
     */
    private _startActions(type: TimeAxis): void {
        this.timeAxis = type;
        this.actionList[this.indexAction].onStart?.(type);
    }

    /**
     * 更新所有Action。这是内部函数，请不要外部调用
     * @returns 返回true表示继续执行所有Action。false表示不需要再执行了，从父级中删除。
     */
    _updateTween(deltaTime: number): boolean {
        if (this.updateActions(this.timeAxis == "forward" ? deltaTime : -deltaTime)) return true;
        // console.log("repeatCount", this.actionList.length, this.timeAxis, this.repeatCount);
        if (!this.checkRepeatCount()) return false;
        this.repeatCount += this.repeatStep;

        if (this.pingPong) {
            this._startActions(this.timeAxis == "forward" ? "inverse" : "forward");
        } else {
            this.resetActions(this.timeAxis);
            this._startActions(this.timeAxis);
        }
        return true;
    }

    private updateActions(deltaTime: number): boolean {
        let action = this.actionList[this.indexAction];
        if (action.onUpdate(deltaTime * this.timeScale))
            return true;
        action.onCompleted?.();

        // console.log("indexAction", this.actionList.length, this.timeAxis, this.indexAction);
        if (!this.checkIndexActions()) return false;
        this.timeAxis == "forward" ? this.indexAction++ : this.indexAction--;

        let nextAction = this.actionList[this.indexAction];
        nextAction.onStart?.(this.timeAxis);
        return this.updateActions(deltaTime);
    }

    /**
     * 清理tween状态。这是内部函数，请不要外部调用
     */
    _clear(): void {
        for (let action of this.actionList)
            action.onCleared?.();
        this._isPlaying = false;
        this._isPaused = false;
        if (this.onFinallyFunc != null) {
            this.onFinallyFunc.call(this.checkIndexActions());
        }
    }

    private checkRepeatCount(): boolean {
        return this.repeatStep == 1 ? this.repeatCount + 1 < this.repeatTimes : this.repeatCount > 0;
    }

    private checkIndexActions(): boolean {
        return this.timeAxis == "forward" ? this.indexAction + 1 < this.actionList.length : this.indexAction > 0;
    }

    //----------------------------------------------------------------------------------------------------------------------------
    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public static to<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).to(duration, properties, options);
    }

    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param properties 属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public static from<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).from(duration, properties, options);
    }

    /**
     * 对目标对象属性进行补间动作
     * @param target 目标
     * @param duration 补间时长
     * @param fromProperties 起始属性集
     * @param toProperties 终止属性集
     * @param options 补间可选参数
     * @returns 返回当前补间动画实例
     */
    public static fromTo<T extends Object>(target: T, duration: number, fromProperties: ConstructorType<T>, toProperties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).fromTo(duration, fromProperties, toProperties, options);
    }

    /**
      * 对目标对象属性进行补间动作
      * @param target 目标
      * @param duration 补间时长
      * @param properties 属性集
      * @param options 补间可选参数
      * @returns 返回当前补间动画实例
      */
    public static by<T extends Object>(target: T, duration: number, properties: ConstructorType<T>, options?: ITweenOption<T>): XTween<T> {
        return new XTween(target).by(duration, properties, options);
    }

    /**
     * 删除所有的Tween
     */
    public static removeAllTweens(): void {
        return tweenManager.removeAll();
    }

    /**
     * 删除目标身上所有的Tween
     * @param tag 目标对象
     */
    public static removeTagTweens<T>(tag: T): void {
        tweenManager.removeTag(tag);
    }

    /**
     * 目标是否包含Tween
     * @param tag 目标对象
     */
    public static containTweens<T>(tag: T): boolean {
        return tweenManager.containTweens(tag);
    }

    /**
     * Tween的更新函数
     */
    public static updateTweens(time: number = Date.now()): void {
        tweenManager.updateTweens(time);
    }
}