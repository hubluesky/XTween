[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/ **organization/repository** )

# XTween

这是一个TypeScript的补间动画，比JS的好处来说是有类型推导，不必担心属性写错了，为什么这个动画没有起效的问题。丰富的功能与简单容易使用的接口，基本使用过一次就能记得这个便捷的使用方式。

## 源代码使用

下载后，需要先 `npm -install`安装jest，然后就可以运行 `npm test`运行这里面的测试用例。
也可以运行examples里面随手写的 `Examples.html`可视化测试效果。然后自己改改想要的效果。

### 开始使用

```ts
class Size {
    width: number = 100;
    height: number = 200;
}

let size = new Size();
```

假设我们有这么一个对象，想对宽度做补间动画，在0.6秒后宽度变为150，只需要使用以前这行代码即可。

```
XTween.to(size, 0.6, { width: 150 }).play();
```

也可以使用by的方式来做**增量**补间动画。

```
XTween.by(size, 0.6, { width: 50 }).play();
```

by跟to的区别是：

* to是每帧把当前属性的值修改到目标的值。例如上面的width：150就是把width每帧修改到150为止。
* by是每帧给当前属性的值增量修改到目标的值。例如上面的width：50就是把width在原来100的基础上再增加50
  总结：to会每帧覆盖原来属性的值， 而by不会，只会每帧修改属性的值。

### TweenOption

无论是to还是by，都有提供option参数，option的内容以下，支持缓动函数，插值函数，以及三种时机下的回调函数。

```
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
```

### 缓动类型（`Easing`）

接上面的例子，如果不想这0.6秒都是线性插值的，可以使用Easing。XTween自带了10种easing，每种easing都有in、out、和inout。当然了，除了以下自带的10种easing方式，还支持自定义，只需要满足这个函数格式就行：`type EasingFunction = (amount: number) => number;`

* `Quadratic`
* `Cubic`
* `Quartic`
* `Quintic`
* `Sinusoidal`
* `Exponential`
* `Circular`
* `Elastic`
* `Back`
* `Bounce`

```
XTween.to(size, 0.6, { width: 150 }, { easing: "backOut" }).play();
```

### 自定义缓动类型（`BezierEase`和`SvgPathEase`）

PS：SvgPath算法是从[gsap](https://github.com/greensock/GSAP)中抄来，不过源码是js的，我照着画了个ts版本的，使用请遵守gsap开源协议。

```
// BezierEase
XTween.to(size, 0.6, { width: 150 }, { easing: BezierEase.create(0, 0, 1, 1) }).play();
// SvgPathEase
XTween.to(size, 0.6, { width: 150 }, { easing: SvgPathEase.create("M0,0 C0,0 1,1 1,1") }).play();
// 自定义easing方式
XTween.to(size, 0.6, { width: 150 }, {
    easing: function (amount: number): number {
        return amount;
    }
}).play();
```

### 插值类型（`Interpolation`)

在tween计算属性补间动画的过程中，有三个值，分别是start（属性的起始值）、end（属性的结束值）、ratio（属性随时间的比例值），Easing是对缓动比例ratio进行插值，而 `Interpolation`插值是对start、end和ratio这三个数进行插值，默认是使用线性插值方式，如果有需要，也可以自定义插值方式。

```
XTween.to(size, 0.6, { width: 150 }, { progress: XTween.Easing.sinusoidalIn }).play();
```

### 回调函数

回调函数分别是：

* `onStart` 当缓动动作启动时触发
* `onUpdate` 当缓动动作更新时触发（每帧触发）
* `onComplete` 当缓动动作完成时触发

```
XTween.to(size, 0.6, { width: 150 }, {
    onStart: () => {
        console.log("on width change start");
    },
    onUpdate: (t, r) => {
        console.log("on width changing", r);
    },
    onComplete: () => {
        console.log("on width change complete");
    },
}).play();
```

### 多个动画之间的拼接

```
// 同时执行size.width和transform.rotation动画
XTween.to(size, 0.6, { height: 250 }).add(
    XTween.to(size, 0.6, { width: 150 }),
    XTween.to(transform, 0.3, { rotation: 30 })
).play();
```

### 连续补间动画

如果想先做width动画后，再在1秒内把height变为300，只需要连to两下就可以了。

```
XTween.to(size, 0.6, { width: 150 }).to(1, { height: 300 }).play();
```

### 转变动画target

```
class Transform {
    position = { x: 0, y: 0, z: 0 };
    rotation: number = 0;
}

let transform= new Transform();
```

先是修改size的width，完成后再修改transform的rotation

```
XTween.to(size, 0.6, { width: 150 }).to(transform, 0.3, { rotation: 30 }).play();
```

### 重复动画

```
// 重复执行4次
new XTween(size, 4).to(0.6, { width: 150 }).to(0.7, { width: 100 }).play();
// 永远重复
new XTween(size, Infinity).to(0.6, { width: 150 }).to(0.7, { height: 100 }).play();
// pingPong模式，来回补间动画
new XTween(size, Infinity, true).to(0.6, { width: 150 }).play();
```

repeat动画会记录被重复的tween的起始值，使每一次重复都能从头开始。如果pingpong模式为true，就会在repeat一次后，被重复的tween会整个被反过来执行，比如上面的第二个动画。size对象第一次执行为：width会从“当前值”到150，然后就是height从“当前值”到100。第二次执行为：height从100到“当前值”，然后就是width从150到“当前值，如此重复。

### 并行执行多个Tween

```
// 同时执行size.width和transform.rotation动画
XTween.to(size, 0.6, { height: 150 }).add(
    XTween.to(size, 0.6, { width: 150 }),
    XTween.to(transform, 0.3, { rotation: 30 })
).play();
```

### 内嵌重复Tween动画

```
// 先执行size.width然后重复多次transform.rotation动画，最后再执行size.width动画
XTween.to(size, 0.6, { height: 150 }).add(
    new XTween(transform, 6, true).to(0.6, { rotation: 360 }),
).to(0.5, { width: 300 }).play();
```

### 一些功能函数

`setTimeScale` 当前tween的时间缩放
`setTag` 设置Tween的标识，方便删除时使用
`delay` 延迟多久后执行
`call` 回调函数
`play` 开始Tween
`replay` 重新开始Tween
`reverse` 在开始Tween之后，可以倒着往回播放Tween，支持反复调用，来回正反播放。
`pause` 暂停tween（只有最顶层的tween才有效果）
`resume` 恢复tween（只有最顶层的tween才有效果)
`stop` 停止tween
`set` 直接设置对象Target的属性
`removeTagTweens` 删除目标身上所有的tween
`onFinally` 无论此tween是正常完成，还是中途被停止，只要停止了，就会回调此函数

### 复杂示例：

```ts
new XTween(target)
    .to(1000, { width: 500, rotation: 360 }, { easing: "backOut" })
    .to(1500, { height: 600 }, {
        onComplete: (target) => {
            console.log("onComplete 1", target);
        }
    })
    .delay(1000)
    .add(new XTween(target, 4).to(300, { alpha: 1 }).to(300, { alpha: 0 }))
    .add(XTween.to(target, 1000, { rotation: 100 }))
    .to(target2, 1000, { rotation: 100 })
    .call(() => {
        console.log("Call 1", target, target2);
    })
    .to(1500, { position: { x: 10, y: 20, z: 30 } }, {
        onStart: (target) => {
            console.log("onStart ", target);
        }
    })
    .set({ visable: false })
    .call(() => {
        console.log("Call 2", target, target2);
    })
    .onFinally(() => console.log("onFinally"))
    .play();
```
