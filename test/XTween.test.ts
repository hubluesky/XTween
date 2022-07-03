import { XTween } from "../src/XTween";

// setInterval(function () {
//     XTween.updateTweens();
// }, 1);

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
    // mockCall();
    let t = new XTween({}).call(mockCall).start();
    expect(t.isPlaying).toBeTruthy();
    expect(t.isPaused).toBeFalsy();
    expect(mockCall).toHaveBeenCalled();
});