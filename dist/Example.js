import { xtween, XTween } from "./XTween";
// 注意使用时需要每帧更新一下
setInterval(XTween.updateTweens, 1);
class Target {
    constructor() {
        this.visable = false;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = 0;
        this.alpha = 0;
        this.width = 100;
        this.height = 200;
    }
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
//# sourceMappingURL=Example.js.map