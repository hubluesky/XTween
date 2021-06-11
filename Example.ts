import { xtween, XTween } from "./XTween";

console.log("start xtween example.");

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

// let by = xtween(target).by(100, { width: 20, position: { x: 0, z: 0, y: 10 } }, {
//     onUpdate: () => {
//         console.log("target.width", target.width, target.position.y)
//     }
// })
//     .call(() => console.log("+++++++++++++")
//     );
// xtween(target).repeat(2, true, by)
//     .start();

// xtween(target).delay(50).call(()=> target.width+=100).start();

xtween(target)
    .to(100, { width: 500, rotation: 360 }, { easing: XTween.Easing.Back.Out })
    .to(150, { height: 600 }, { onComplete: (target) => console.log("onComplete 1", target) })
    .delay(100)
    .repeat(4, true, xtween(target).to(300, { alpha: 1 }).to(300, { alpha: 0 }))
    .sequence(xtween(target).to(100, { rotation: 100 }), xtween(target2).to(100, { rotation: 100 }))
    .call(() => console.log("Call 1", target, target2))
    .to(150, { position: { x: 10, y: 20, z: 30 } }, {
        onStart: (target) => console.log("onStart ", target)
    })
    .set({ visable: false })
    .call(() => console.log("Call 2", target, target2))
    .start();

console.log("end xtween example.");