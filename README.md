# XTween
这是一个TypeScript的补间动画
 * 支持对象的number属性
 * 支持自定义插值，默认是线性插值。可以自定义为贝塞尔等。
 * 支持每一个动作进行onStart, onUpdate, onComplete事件回调。
 * 支持泛型参数推导。可以对要补间的动画参数进行语法检查和补全。
 * 支持连续拼接动作

示例：
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