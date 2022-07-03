import { XTween } from "../src/XTween";

let timer: NodeJS.Timer;
let frameCount = 0;
let lastDeltaTime: number = 0;
let curDeltaTime: number = 0;
let curTime: number = 0;
let totalTime: number = 0;
function startUpdateXTween() {
    console.log("startUpdateXTween", Date.now());
    let lastTime = Date.now();
    timer = setInterval(function () {
        frameCount++;
        lastDeltaTime = curDeltaTime;
        curTime = Date.now();
        curDeltaTime = curTime - lastTime;
        lastTime = curTime;
        totalTime += curDeltaTime;

        console.log("updateTweens ", curDeltaTime);
        XTween.updateTweens();
    }, 1);
}
function stopUpdateXTween() {
    console.log("stopUpdateXTween", totalTime, Date.now());
    clearInterval(timer);
}

beforeAll(() => {
    jest.useFakeTimers();
    startUpdateXTween();
    jest.advanceTimersByTime(1);
});

afterAll(() => {
    stopUpdateXTween();
    jest.useRealTimers();
}, 1000);

function add(a: number, b: number): number {
    return a + b;
}

describe("add function", () => {
    it("1 + 1 = 2", () => {
        expect(add(1, 1)).toEqual(2);
    });
});

test('empty xtween', () => {
    let obj = {};
    let t = new XTween(obj);
    expect(t.target).toEqual(obj);
    expect(t.repeatTimes).toBe(0);
    expect(t.pingPong).toBeFalsy();
    expect(t.timeScale).toBe(1);
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeFalsy();
});

test("finally call xtween", () => {
    const mockCall = jest.fn();
    new XTween({}).onFinally(mockCall).start();
    jest.advanceTimersByTime(1);
    expect(mockCall).toHaveBeenCalled();
});

test('xtween repeat init value', () => {
    let t = new XTween({}, 2, true);
    expect(t.repeatTimes).toBe(2);
    expect(t.pingPong).toBe(true);
});

test('xtween playing value', () => {
    let t = new XTween({}).start();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween pause value', () => {
    let t = new XTween({}).start().pause();
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeTruthy();
});

test('xtween resume value', () => {
    let t = new XTween({}).start().pause().resume();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween stop value', () => {
    let t = new XTween({}).stop();
    expect(t.isPlaying).toBeFalsy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween stop restart value', () => {
    let t = new XTween({}).stop().start();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
});

test('xtween call', () => {
    let call = () => {
        console.log(" call ");
    };

    const mockCall = jest.fn().mockImplementation(call);
    let t = new XTween({}).call(mockCall).start();
    jest.advanceTimersByTime(1);
    expect(mockCall).toHaveBeenCalled();
});