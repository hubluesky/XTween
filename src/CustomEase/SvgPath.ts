const _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig;
const _numbersExp = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig;
const _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig;
const _selectorExp = /(^[#\.][a-z]|[a-y][a-z])/i;
const _DEG2RAD = Math.PI / 180;
const _RAD2DEG = 180 / Math.PI;
const _sin = Math.sin;
const _cos = Math.cos;
const _abs = Math.abs;
const _sqrt = Math.sqrt;
const _atan2 = Math.atan2;
const _largeNum = 1e8;

export default class SvgPath {

    public static stringToRawPath(d: string) {
        let a: any[] = (d + "").replace(_scientific, function (m) {
            let n = +m;
            return n < 0.0001 && n > -0.0001 ? 0 : n;
        }).match(_svgPathExp) as any || [];
        //some authoring programs spit out very small numbers in scientific notation like "1e-5", so make sure we round that down to 0 first.
        let path = [];
        let relativeX = 0;
        let relativeY = 0;
        let twoThirds = 2 / 3;
        let elements = a.length;
        let points = 0;
        let errorMessage = "ERROR: malformed path: " + d;
        // i,
        // j,
        // x,
        // y,
        let command;
        let isRelative: boolean;
        let segment: number[];
        let startX: number;
        let startY: number;
        let difX: number;
        let difY: number;
        // beziers,
        // prevCommand,
        // flag1,
        // flag2,
        const line = function line(sx, sy, ex, ey) {
            difX = (ex - sx) / 3;
            difY = (ey - sy) / 3;
            segment.push(sx + difX, sy + difY, ex - difX, ey - difY, ex, ey);
        };

        if (!d || !isNaN(a[0]) || isNaN(a[1])) {
            console.log(errorMessage);
            return path;
        }

        for (let i = 0; i < elements; i++) {
            let prevCommand = command;

            if (isNaN(a[i])) {
                command = a[i].toUpperCase();
                isRelative = command !== a[i]; //lower case means relative
            } else {
                //commands like "C" can be strung together without any new command characters between.
                i--;
            }

            let x = +a[i + 1];
            let y = +a[i + 2];

            if (isRelative) {
                x += relativeX;
                y += relativeY;
            }

            if (!i) {
                startX = x;
                startY = y;
            } // "M" (move)


            if (command === "M") {
                if (segment) {
                    if (segment.length < 8) {
                        //if the path data was funky and just had a M with no actual drawing anywhere, skip it.
                        path.length -= 1;
                    } else {
                        points += segment.length;
                    }
                }

                relativeX = startX = x;
                relativeY = startY = y;
                segment = [x, y];
                path.push(segment);
                i += 2;
                command = "L"; //an "M" with more than 2 values gets interpreted as "lineTo" commands ("L").
                // "C" (cubic bezier)
            } else if (command === "C") {
                if (!segment) {
                    segment = [0, 0];
                }

                if (!isRelative) {
                    relativeX = relativeY = 0;
                } //note: "*1" is just a fast/short way to cast the value as a Number. WAAAY faster in Chrome, slightly slower in Firefox.


                segment.push(x, y, relativeX + a[i + 3] * 1, relativeY + a[i + 4] * 1, relativeX += a[i + 5] * 1, relativeY += a[i + 6] * 1);
                i += 6; // "S" (continuation of cubic bezier)
            } else if (command === "S") {
                difX = relativeX;
                difY = relativeY;

                if (prevCommand === "C" || prevCommand === "S") {
                    difX += relativeX - segment[segment.length - 4];
                    difY += relativeY - segment[segment.length - 3];
                }

                if (!isRelative) {
                    relativeX = relativeY = 0;
                }

                segment.push(difX, difY, x, y, relativeX += a[i + 3] * 1, relativeY += a[i + 4] * 1);
                i += 4; // "Q" (quadratic bezier)
            } else if (command === "Q") {
                difX = relativeX + (x - relativeX) * twoThirds;
                difY = relativeY + (y - relativeY) * twoThirds;

                if (!isRelative) {
                    relativeX = relativeY = 0;
                }

                relativeX += a[i + 3] * 1;
                relativeY += a[i + 4] * 1;
                segment.push(difX, difY, relativeX + (x - relativeX) * twoThirds, relativeY + (y - relativeY) * twoThirds, relativeX, relativeY);
                i += 4; // "T" (continuation of quadratic bezier)
            } else if (command === "T") {
                difX = relativeX - segment[segment.length - 4];
                difY = relativeY - segment[segment.length - 3];
                segment.push(relativeX + difX, relativeY + difY, x + (relativeX + difX * 1.5 - x) * twoThirds, y + (relativeY + difY * 1.5 - y) * twoThirds, relativeX = x, relativeY = y);
                i += 2; // "H" (horizontal line)
            } else if (command === "H") {
                line(relativeX, relativeY, relativeX = x, relativeY);
                i += 1; // "V" (vertical line)
            } else if (command === "V") {
                //adjust values because the first (and only one) isn't x in this case, it's y.
                line(relativeX, relativeY, relativeX, relativeY = x + (isRelative ? relativeY - relativeX : 0));
                i += 1; // "L" (line) or "Z" (close)
            } else if (command === "L" || command === "Z") {
                if (command === "Z") {
                    x = startX;
                    y = startY;
                    // segment.closed = true;
                }

                if (command === "L" || _abs(relativeX - x) > 0.5 || _abs(relativeY - y) > 0.5) {
                    line(relativeX, relativeY, x, y);

                    if (command === "L") {
                        i += 2;
                    }
                }

                relativeX = x;
                relativeY = y; // "A" (arc)
            } else if (command === "A") {
                let flag1 = a[i + 4];
                let flag2 = a[i + 5];
                let difX = a[i + 6];
                let difY = a[i + 7];
                let j = 7;

                if (flag1.length > 1) {
                    // for cases when the flags are merged, like "a8 8 0 018 8" (the 0 and 1 flags are WITH the x value of 8, but it could also be "a8 8 0 01-8 8" so it may include x or not)
                    if (flag1.length < 3) {
                        difY = difX;
                        difX = flag2;
                        j--;
                    } else {
                        difY = flag2;
                        difX = flag1.substr(2);
                        j -= 2;
                    }

                    flag2 = flag1.charAt(1);
                    flag1 = flag1.charAt(0);
                }

                let beziers = SvgPath.arcToSegment(relativeX, relativeY, +a[i + 1], +a[i + 2], +a[i + 3], +flag1, +flag2, (isRelative ? relativeX : 0) + difX * 1, (isRelative ? relativeY : 0) + difY * 1);
                i += j;

                if (beziers) {
                    for (j = 0; j < beziers.length; j++) {
                        segment.push(beziers[j]);
                    }
                }

                relativeX = segment[segment.length - 2];
                relativeY = segment[segment.length - 1];
            } else {
                console.log(errorMessage);
            }
        }

        let i = segment.length;

        if (i < 6) {
            //in case there's odd SVG like a M0,0 command at the very end.
            path.pop();
            i = 0;
        } else if (segment[0] === segment[i - 2] && segment[1] === segment[i - 1]) {
            // segment.closed = true;
        }

        // path.totalPoints = points + i;
        return path;
    }


    private static arcToSegment(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y): number[] {
        if (lastX === x && lastY === y) {
            return null;
        }

        rx = _abs(rx);
        ry = _abs(ry);

        let angleRad = angle % 360 * _DEG2RAD;
        let cosAngle = _cos(angleRad);
        let sinAngle = _sin(angleRad);
        let PI = Math.PI;
        let TWOPI = PI * 2;
        let dx2 = (lastX - x) / 2;
        let dy2 = (lastY - y) / 2;
        let x1 = cosAngle * dx2 + sinAngle * dy2;
        let y1 = -sinAngle * dx2 + cosAngle * dy2;
        let x1_sq = x1 * x1;
        let y1_sq = y1 * y1;
        let radiiCheck = x1_sq / (rx * rx) + y1_sq / (ry * ry);

        if (radiiCheck > 1) {
            rx = _sqrt(radiiCheck) * rx;
            ry = _sqrt(radiiCheck) * ry;
        }

        let rx_sq = rx * rx;
        let ry_sq = ry * ry;
        let sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);

        if (sq < 0) {
            sq = 0;
        }

        let coef = (largeArcFlag === sweepFlag ? -1 : 1) * _sqrt(sq);
        let cx1 = coef * (rx * y1 / ry);
        let cy1 = coef * -(ry * x1 / rx);
        let sx2 = (lastX + x) / 2;
        let sy2 = (lastY + y) / 2;
        let cx = sx2 + (cosAngle * cx1 - sinAngle * cy1);
        let cy = sy2 + (sinAngle * cx1 + cosAngle * cy1);
        let ux = (x1 - cx1) / rx;
        let uy = (y1 - cy1) / ry;
        let vx = (-x1 - cx1) / rx;
        let vy = (-y1 - cy1) / ry;
        let temp = ux * ux + uy * uy;
        let angleStart = (uy < 0 ? -1 : 1) * Math.acos(ux / _sqrt(temp));
        let angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos((ux * vx + uy * vy) / _sqrt(temp * (vx * vx + vy * vy)));

        isNaN(angleExtent) && (angleExtent = PI); //rare edge case. Math.cos(-1) is NaN.

        if (!sweepFlag && angleExtent > 0) {
            angleExtent -= TWOPI;
        } else if (sweepFlag && angleExtent < 0) {
            angleExtent += TWOPI;
        }

        angleStart %= TWOPI;
        angleExtent %= TWOPI;

        let segments = Math.ceil(_abs(angleExtent) / (TWOPI / 4));
        let rawPath: number[] = [];
        let angleIncrement = angleExtent / segments;
        let controlLength = 4 / 3 * _sin(angleIncrement / 2) / (1 + _cos(angleIncrement / 2));
        let ma = cosAngle * rx;
        let mb = sinAngle * rx;
        let mc = sinAngle * -ry;
        let md = cosAngle * ry;

        for (let i = 0; i < segments; i++) {
            angle = angleStart + i * angleIncrement;
            x1 = _cos(angle);
            y1 = _sin(angle);
            ux = _cos(angle += angleIncrement);
            uy = _sin(angle);
            rawPath.push(x1 - controlLength * y1, y1 + controlLength * x1, ux + controlLength * uy, uy - controlLength * ux, ux, uy);
        } //now transform according to the actual size of the ellipse/arc (the beziers were noramlized, between 0 and 1 on a circle).


        for (let i = 0; i < rawPath.length; i += 2) {
            x1 = rawPath[i];
            y1 = rawPath[i + 1];
            rawPath[i] = x1 * ma + y1 * mc + cx;
            rawPath[i + 1] = x1 * mb + y1 * md + cy;
        }

        let length = rawPath.length;
        rawPath[length - 2] = x; //always set the end to exactly where it's supposed to be
        rawPath[length - 1] = y;
        return rawPath;
    }
    //Spits back a RawPath with absolute coordinates. Each segment starts with a "moveTo" command (x coordinate, then y) and then 2 control points (x, y, x, y), then anchor. The goal is to minimize memory and maximize speed.
}