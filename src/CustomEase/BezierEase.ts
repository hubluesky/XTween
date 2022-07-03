import ICustomEase, { EasingFunction } from "./CustomEase";

export default class BezierEase implements ICustomEase {
    public readonly easeFunc: EasingFunction;

    public static create(x1: number, y1: number, x2: number, y2: number): EasingFunction {
        return new BezierEase(x1, y1, x2, y2).easeFunc;
    }

    private constructor(x1: number, y1: number, x2: number, y2: number) {
        this.easeFunc = (progress: number): number => {
            if (x1 === y1 && x2 === y2)
                return progress;

            if (progress === 0) return 0;
            if (progress === 1) return 1;

            const val = [];
            for (let i = 0; i < 11; ++i)
                val[i] = this.bezierCalc(i * 0.1, x1, x2);

            return this.bezierCalc(this.bezierX(x1, x2, progress, val), y1, y2);
        }
    }

    private bezierCalc(progress: number, x1: number, x2: number): number {
        return ((this.bezierA(x1, x2) * progress + this.bezierB(x1, x2)) * progress + this.bezierC(x1)) * progress;
    }

    private bezierA(x1: number, x2: number): number {
        return 1.0 - 3.0 * x2 + 3.0 * x1;
    }

    private bezierB(x1: number, x2: number): number {
        return 3.0 * x2 - 6.0 * x1;
    }

    private bezierC(x1: number): number {
        return 3.0 * x1;
    }

    private bezierX(x1: number, x2: number, progress: number, val: number[]): number {
        let start = 0;
        let current = 1;

        for (; current !== 10 && val[current] <= progress; ++current) {
            start += 0.1;
        }
        --current;

        const dist = (progress - val[current]) / (val[current + 1] - val[current]);
        const guessForT = start + dist * 0.1;

        const initialSlope = this.bezierSlope(guessForT, x1, x2);
        if (initialSlope >= 0.001) {
            return this.bezierNewtonRaphsonIterate(progress, guessForT, x1, x2);
        }
        if (initialSlope === 0.0) {
            return guessForT;
        }

        return this.bezierBinarySubdivide(progress, start, start + 0.1, x1, x2);
    }

    private bezierSlope(progress: number, x1: number, x2: number): number {
        return 3.0 * this.bezierA(x1, x2) * progress * progress + 2.0 * this.bezierB(x1, x2) * progress + this.bezierC(x1);
    }

    private bezierNewtonRaphsonIterate(progress: number, guessForT: number, x1: number, x2: number): number {
        for (let i = 0; i < 4; ++i) {
            const currentSlope = this.bezierSlope(guessForT, x1, x2);
            if (currentSlope === 0.0) {
                return guessForT;
            }
            const currentX = this.bezierCalc(guessForT, x1, x2) - progress;
            guessForT -= currentX / currentSlope;
        }

        return guessForT;
    }

    private bezierBinarySubdivide(progress: number, a: number, b: number, x1: number, x2: number): number {
        let currentX: number;
        let currentT: number;
        let i = 0;

        do {
            currentT = a + (b - a) / 2.0;
            currentX = this.bezierCalc(currentT, x1, x2) - progress;
            if (currentX > 0.0) {
                b = currentT;
            } else {
                a = currentT;
            }
        }

        while (Math.abs(currentX) > 0.0000001 && ++i < 10);
        return currentT;
    }
}
