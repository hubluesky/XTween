import { XTween } from "../src/XTween";

const frameInterval = 88;
let timer: NodeJS.Timer;

function startUpdateXTween() {
    XTween.TIME_UNIT = 1;
    timer = setInterval(function () {
        XTween.updateTweens();
    }, frameInterval);
}
function stopUpdateXTween() {
    clearInterval(timer);
}

beforeAll(() => {
    jest.useFakeTimers();
    startUpdateXTween();
    jest.advanceTimersByTime(frameInterval);
});

afterAll(() => {
    stopUpdateXTween();
    jest.useRealTimers();
});

// function add(a: number, b: number): number {
//     return a + b;
// }

// describe("add function", () => {
//     it("1 + 1 = 2", () => {
//         expect(add(1, 1)).toEqual(2);
//     });
// });

test('empty xtween', () => {
    let obj = {};
    let t = new XTween(obj);
    expect(t.tag).toEqual(obj);
    expect(t.repeatTimes).toBe(0);
    expect(t.pingPong).toBeFalsy();
    expect(t.timeScale).toBe(1);
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeFalsy();
});

test("finally call xtween", () => {
    const mockCall = jest.fn();
    new XTween({}).onFinally(mockCall).play();
    jest.advanceTimersByTime(frameInterval * 10);
    expect(mockCall).toBeCalledTimes(1);
});

test('xtween repeat init value', () => {
    let t = new XTween({}, 2, true);
    expect(t.repeatTimes).toBe(2);
    expect(t.pingPong).toBe(true);
});

test('xtween playing value', () => {
    let t = new XTween({}).delay(frameInterval).play();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween pause value', () => {
    let t = new XTween({}).delay(frameInterval).play().pause();
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeTruthy();
});

test('xtween resume value', () => {
    let t = new XTween({}).delay(frameInterval).play().pause().resume();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween stop value', () => {
    let t = new XTween({}).stop();
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween stop restart value', () => {
    let t = new XTween({}).delay(frameInterval).stop().play();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween call', () => {
    let call = () => { };

    const mockCall = jest.fn().mockImplementation(call);
    let t = new XTween({}).call(mockCall).play();
    jest.advanceTimersByTime(frameInterval);
    expect(mockCall).toHaveBeenCalled();
});

test("xtween to", () => {
    let obj = { x: 5 };
    const duration = 200;
    XTween.to(obj, duration, { x: 30 }).play();
    jest.advanceTimersByTime(duration + frameInterval);
    expect(obj.x).toBe(30);
});

test("xtween by", () => {
    let obj = { x: 5 };
    const duration = 200;
    XTween.by(obj, duration, { x: 30 }).play();
    jest.advanceTimersByTime(duration + frameInterval);
    expect(obj.x).toEqual(35);
});

test("xtween to time", () => {
    for (let i = 1; i <= 1000; i++) {
        let obj = { x: 0 };
        XTween.to(obj, i, { x: i }).play();
        jest.advanceTimersByTime(i + frameInterval);
        expect(obj.x).toBe(i);
    }
});

test("xtween 2to", () => {
    let obj = { x: 5 };
    XTween.to(obj, 200, { x: 30 }).to(130, { x: 40 }).play();
    jest.advanceTimersByTime(200 + 130 + frameInterval);
    expect(obj.x).toBe(40);
});

test("xtween delay", () => {
    let startTime: number = 0;
    let endTime: number = 0;
    let delayTime = 140;

    const mockStartCall = jest.fn().mockImplementation(() => startTime = Date.now());
    const mockEndCall = jest.fn().mockImplementation(() => endTime = Date.now());
    new XTween({}).call(mockStartCall).delay(delayTime).call(mockEndCall).play();
    jest.advanceTimersByTime(delayTime + frameInterval); // 如果此tween是下一帧才被运行

    expect(mockStartCall).toBeCalledTimes(1);
    expect(mockEndCall).toBeCalledTimes(1);

    let duration = endTime - startTime;
    expect(duration).toBeGreaterThanOrEqual(delayTime);
    expect(duration).toBeLessThanOrEqual(delayTime + frameInterval);
});

test("xtween repeat fromTo", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times).fromTo(230, { x: 0 }, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBe(40);
});

test("xtween repeat to", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times).to(140, { x: 30 }).to(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBe(40);
});

test("xtween repeat by 2", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times).by(140, { x: 30 }).by(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBeCloseTo(5 + 30 + 40);
});

test("xtween repeat from 2", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times).from(140, { x: 30 }).from(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBe(5);
});

test("xtween repeat pingpong to 2", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times, true).to(140, { x: 30 }).to(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBe(5);
});

test("xtween repeat pingpong by 2", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times, true).by(140, { x: 30 }).by(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBeCloseTo(5);
});

test("xtween repeat pingpong from 2", () => {
    let obj = { x: 5 };
    let times = 4;
    new XTween(obj, times, true).from(140, { x: 30 }).from(230, { x: 40 }).play();
    jest.advanceTimersByTime((140 + 230) * times + frameInterval);
    expect(obj.x).toBe(30);
});

test("xtween inner repeat to", () => {
    let obj = { x: 5, angle: 0 };
    let times = 4;
    XTween.to(obj, 50, { angle: 360 }).add(
        new XTween(obj, times).to(140, { x: 30 }).to(230, { x: 40 })
    ).to(47, { angle: -340 }).play();
    jest.advanceTimersByTime(50 + (140 + 230) * times + 47 + frameInterval);
    expect(obj.x).toBe(40);
    expect(obj.angle).toBe(-340);
});

test("xtween inner repeat and repeat", () => {
    let obj = { x: 5, alpha: 1 };
    let times1 = 7, times2 = 3, duration = 110, delay = 140;
    new XTween(obj, times1).add(
        new XTween(obj, times2, true).add(
            XTween.to(obj, duration, { x: 124 }),
            XTween.to(obj, duration, { alpha: 0.24 }),
        )
    ).delay(delay).play();
    jest.advanceTimersByTime(times1 * (duration * times2 + delay) + frameInterval);
    expect(obj.x).toBe(124);
    expect(obj.alpha).toBe(0.24);
});

