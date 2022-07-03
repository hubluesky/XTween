import SvgPathEase from "../src/CustomEase/SvgPathEase";
import { XTween } from "../src/XTween";

console.log("start xtween example.");

// 注意使用时需要每帧更新一下
setInterval(XTween.updateTweens, 1);

class Target {
    visable: boolean = false;
    position = { x: 0, y: 0, z: 0 };
    rotation: number = 0;
    alpha: number = 1;
    width: number = 100;
    height: number = 200;
}

let target = new Target();
let target2 = new Target();

// function logTarget(target: Target, target2: Target): void {
//     console.log("Call 1", target, target2);
// }

let call = () => {
    console.log("finally call ");
};
new XTween({}).onFinally(call).start();

// xtween(target).to(1, { alpha: 2 }, {
//     onUpdate: () => {
//         console.log("target", target.alpha);
//     }, easing: SvgPathEase.create("M0,0 C0.104,0.204 0.492,1 1,1")
// }).start();

// xtween(target)
//     .to(100, { width: 500, rotation: 360 }, { easing: XTween.Easing.Back.Out })
//     .to(150, { height: 600 }, { onComplete: (target) => console.log("onComplete 1", target) })
//     .delay(100)
//     .repeat(4, true, xtween(target).to(300, { alpha: 1 }).to(300, { alpha: 0 }))
//     .sequence(xtween(target).to(100, { rotation: 100 }), xtween(target2).to(100, { rotation: 100 }))
//     .call(logTarget, undefined, target, target2)
//     .to(150, { position: { x: 10, y: 20, z: 30 } }, {
//         onStart: (target) => console.log("onStart ", target)
//     })
//     .set({ visable: false })
//     .call(() => console.log("Call 2", target, target2))
//     .start();

// console.log("end xtween example.");

// const t1 = xtween(target.position).to(1, { x: 0, y: 0 }, { onUpdate: () => console.log(target.position) }).call(() => {
//     // t1.stop();
//     console.log("call stop");
//     xtween(target.position).to(1, { x: 500, y: 500 }, { onUpdate: () => console.log(target.position) }).call(() => console.log("tween2 call")).start();
// })
//     .call(() => console.log("tween1 call"))
//     .start();

// xtween(target).repeat(2, true, xtween(target).by(50, { alpha: 0.1 }, {
//     onUpdate: (t, r) => {
//         console.log("by ", r, "\t", target.alpha);
//     }
// }))
//     .call(() => {
//         xtween(target).repeat(2, true, xtween(target).to(50, { alpha: 1.1 }, {
//             onUpdate: (t, r) => {
//                 console.log("to ", r, "\t", target.alpha);
//             }
//         })).start();
//     }).onFinally((result) => {
//         console.log("onCompleted " + result);
//     }).start();

    // XTween.removeAllTweens();
// xtween(target).repeat(2, true, xtween(target).by(10, {alpha:1})).start();