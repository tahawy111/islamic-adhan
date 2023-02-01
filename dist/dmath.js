"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DMath = {
    dtr(d) {
        return (d * Math.PI) / 180.0;
    },
    rtd(r) {
        return (r * 180.0) / Math.PI;
    },
    sin(d) {
        return Math.sin(this.dtr(d));
    },
    cos(d) {
        return Math.cos(this.dtr(d));
    },
    tan(d) {
        return Math.tan(this.dtr(d));
    },
    arcsin(d) {
        return this.rtd(Math.asin(d));
    },
    arccos(d) {
        return this.rtd(Math.acos(d));
    },
    arctan(d) {
        return this.rtd(Math.atan(d));
    },
    arccot(x) {
        return this.rtd(Math.atan(1 / x));
    },
    arctan2(y, x) {
        return this.rtd(Math.atan2(y, x));
    },
    fixAngle(a) {
        return this.fix(a, 360);
    },
    fixHour(a) {
        return this.fix(a, 24);
    },
    fix(a, b) {
        a = a - b * Math.floor(a / b);
        return a < 0 ? a + b : a;
    },
};
exports.default = DMath;
//# sourceMappingURL=dmath.js.map