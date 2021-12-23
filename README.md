[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/ **organization/repository** )

# XTween

这是一个TypeScript的补间动画，比JS的好处来说是有类型推导，不必担心属性写错了，为什么这个动画没有起效的问题。丰富的功能与简单容易使用的接口，基本使用过一次就能记得这个便捷的使用方式。

## 开始使用

```ts
class Size {
    width: number = 100;
    height: number = 200;
}

let size = new Size();
```

假设我们有这么一个对象，想对宽度做补间动画，在0.6秒后宽度变为150，只需要使用以前这行代码即可。

```
xtween(size).to(0.6, { width: 150 }).start();
```

也可以使用by的方式来做**增量**补间动画。

```
xtween(size).by(0.6, { width: 50 }).start();
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

##### **缓动类型（Easing）**

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
xtween(size).to(0.6, { width: 150 }, { easing: XTween.Easing.Back.Out }).start();
```

##### 插值类型（`Interpolation`)

在tween计算属性补间动画的过程中，有三个值，分别是start（属性的起始值）、end（属性的结束值）、ratio（属性随时间的比例值），Easing是对缓动比例ratio进行插值，而 `Interpolation`插值是对start、end和ratio这三个数进行插值，默认是使用线性插值方式，如果有需要，也可以自定义插值方式。

```
xtween(size).to(0.6, { width: 150 }, { progress: XTween.Easing.Sinusoidal.In }).start();
```

##### 回调函数

回调函数分别是：

* `onStart` 当缓动动作启动时触发
* `onUpdate` 当缓动动作更新时触发（每帧触发）
* `onComplete` 当缓动动作完成时触发

```
xtween(size).to(0.6, { width: 150 }, {
    onStart: () => {
        console.log("on width change start");
    },
    onUpdate: (t, r) => {
        console.log("on width changing", r);
    },
    onComplete: () => {
        console.log("on width change complete");
    },
}).start();
```

### 多个动画之间的拼接

##### 连续补间动画

如果想先做width动画后，再在1秒内把height变为300，只需要连to两下就可以了。

```
xtween(size).to(0.6, { width: 150 }).to(1, { height: 300 }).start();
```

##### 转变动画target

```
class Transform {
    position = { x: 0, y: 0, z: 0 };
    rotation: number = 0;
}

let transform= new Transform();
```

先是修改size的width，完成后再修改transform的rotation

```
xtween(size).to(0.6, { width: 150 }).then(xtween(transform).to(0.3, { rotation: 30 })).start();
```

##### 重复动画

```
// 重复执行4次
XTween.repeat(4, false, xtween(size).to(0.6, { width: 150 }).to(0.7, { width: 100 })).start();
// 永远重复
XTween.repeatForever(false, xtween(size).to(0.6, { width: 150 }).to(0.7, { width: 100 })).start();
// pingPong模式，来回补间动画
XTween.repeatForever(true, xtween(size).to(0.6, { width: 150 })).start();
```

##### 队列顺序执行动画

```
// 先执行size.width到150，然后再执行transform.rotation到30
XTween.sequence(
    xtween(size).to(0.6, { width: 150 }),
    xtween(transform).to(0.3, { rotation: 30 })
).start();
```

##### 队列并行执行动画

```
// 同时执行size.width和transform.rotation动画
XTween.parallel(
    xtween(size).to(0.6, { width: 150 }),
    xtween(transform).to(0.3, { rotation: 30 })
).start();
```

##### 一些功能函数

`setTimeScale` 当前tween的时间缩放

`delay` 延迟多久后执行

`call` 回调函数

`pause` 暂停tween（只有最顶层的tween才有效果）

`resume` 恢复tween（只有最顶层的tween才有效果)

`stop` 停止tween

`onFinally` 无论此tween是正常完成，还是中途被停止，只要停止了，就会回调此函数

`set` 直接设置对象Target的属性

`removeTargetTweens` 删除目标身上所有的tween


复杂示例：

```ts
// 注意使用时需要每帧更新一下
setInterval(XTween.updateTweens, 1);

class Target {
    visable: boolean = false;
    position = { x: 0, y: 0, z: 0 };
    rotation: number = 0;
    alpha: number = 0;
    width: number = 100;
    height: number = 200;
}

let target = new Target();
let target2 = new Target();

xtween(target)
    .to(1000, { width: 500, rotation: 360 }, { easing: XTween.Easing.Back.Out })
    .to(1500, { height: 600 }, {
        onComplete: (target) => {
            console.log("onComplete 1", target);
        }
    })
    .delay(1000)
    .repeat(4, true, xtween(target).to(300, { alpha: 1 }).to(300, { alpha: 0 }))
    .sequence(xtween(target).to(1000, { rotation: 100 }), xtween(target2).to(1000, { rotation: 100 }))
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
    .start();

```
