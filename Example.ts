import { xtween, XTween } from "./XTween";

class Target {
    visable: boolean = false;
    position = { x: 0, y: 0, z: 0 };
    rotation: number = 0;
    alpha: number = 0;
    width: number = 100;
    height: number = 200;
}

console.log("init xtween");
// 注意使用前需要初始化一下：
setInterval(XTween.intialize(), 1);

let target = new Target();
let target2 = new Target();

xtween(target)
    .to(1000, { width: 500, rotation: 360 }, { easing: XTween.Easing.Back.InOut })
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