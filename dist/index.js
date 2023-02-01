"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adhan = void 0;
const dmath_1 = __importDefault(require("./dmath"));
class Adhan {
    constructor(calcMethod = "MWL") {
        this.calcMethod = calcMethod;
        this.methods = {
            MWL: {
                name: "Muslim World League",
                params: { fajr: 18, isha: 17 },
            },
            ISNA: {
                name: "Islamic Society of North America (ISNA)",
                params: { fajr: 15, isha: 15 },
            },
            MF: {
                name: "Muslims of France (MF)",
                params: { fajr: 12, isha: 12 },
            },
            Egypt: {
                name: "Egyptian General Authority of Survey",
                params: { fajr: 19.5, isha: 17.5 },
            },
            Makkah: {
                name: "Umm Al-Qura University, Makkah",
                params: { fajr: 18.5, isha: "90 min" },
            },
            Karachi: {
                name: "University of Islamic Sciences, Karachi",
                params: { fajr: 18, isha: 18 },
            },
            Tehran: {
                name: "Institute of Geophysics, University of Tehran",
                params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "Jafari" },
            },
            Jafari: {
                name: "Shia Ithna-Ashari, Leva Institute, Qum",
                params: { fajr: 16, isha: 14, maghrib: 4, midnight: "Jafari" },
            },
            JAKIM: {
                name: "Jabatan Kemajuan Islam Malaysia",
                params: { fajr: 20, isha: 18 },
            },
        };
        this.defaultParams = {
            maghrib: "0 min",
            midnight: "Standard",
        };
        this.setting = {
            imsak: "10 min",
            dhuhr: "0 min",
            asr: "Standard",
            highLats: "NightMiddle",
        };
        this.timeNames = {
            imsak: "Imsak",
            fajr: "Fajr",
            sunrise: "Sunrise",
            dhuhr: "Dhuhr",
            asr: "Asr",
            sunset: "Sunset",
            maghrib: "Maghrib",
            isha: "Isha",
            midnight: "Midnight",
        };
        this.timeFormat = "24h";
        this.timeSuffixes = ["am", "pm"];
        this.invalidTime = "-----";
        this.offset = {};
        this.lat;
        this.lng;
        this.elv;
        this.timezone;
        this.jDate;
        this.givenDate;
        this.defParams = this.defaultParams;
        for (let i in this.methods) {
            let params = this.methods[i].params;
            for (let j in this.defParams)
                if (typeof params[j] == "undefined")
                    params[j] = this.defParams[j];
        }
        let params = this.methods[calcMethod].params;
        for (let id in params)
            this.setting[id] = params[id];
        for (let i in this.timeNames)
            this.offset[i] = 0;
    }
    setMethod(method) {
        if (this.methods[method]) {
            this.adjust(this.methods[method].params);
            this.calcMethod = method;
        }
    }
    adjust(params) {
        for (let id in params)
            this.setting[id] = params[id];
    }
    tune(timeOffsets) {
        for (let i in timeOffsets)
            this.offset[i] = timeOffsets[i];
    }
    getMethod() {
        return this.calcMethod;
    }
    getSetting() {
        return this.setting;
    }
    getOffsets() {
        return this.offset;
    }
    getDefaults() {
        return this.methods;
    }
    getTimes(date, coords, timezone, dst, format) {
        this.lat = coords[0];
        this.lng = coords[1];
        this.elv = coords[2] ? coords[2] : 0;
        this.givenDate = date;
        this.timeFormat = format || this.timeFormat;
        if (date.constructor === Date)
            date = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        if (typeof timezone == "undefined" || timezone == "auto")
            timezone = this.getTimeZone(date);
        if (typeof dst == "undefined" || dst == "auto")
            dst = this.getDst(date);
        this.timezone = timezone + (1 * dst ? 1 : 0);
        this.jDate = this.julian(date[0], date[1], date[2]) - this.lng / (15 * 24);
        return this.computeTimes();
    }
    computeTimes() {
        let times = {
            imsak: 5,
            fajr: 5,
            sunrise: 6,
            dhuhr: 12,
            asr: 13,
            sunset: 18,
            maghrib: 18,
            isha: 18,
        };
        times = this.compute(times);
        times = this.adjustTimes(times);
        times.midnight =
            this.setting.midnight == "Jafari"
                ? times.sunset + this.timeDiff(times.sunset, times.fajr) / 2
                : times.sunset + this.timeDiff(times.sunset, times.sunrise) / 2;
        return this.modifyFormats(times);
    }
    getFormattedTime(time, format, suffixes) {
        if (isNaN(time))
            return this.invalidTime;
        if (format == "Float")
            return time;
        suffixes = suffixes || this.timeSuffixes;
        time = dmath_1.default.fixHour(time + 0.5 / 60);
        let hours = Math.floor(time);
        let minutes = Math.floor((time - hours) * 60);
        let suffix = format == "12h" ? suffixes[hours < 12 ? 0 : 1] : "";
        let hour = format == "24h"
            ? this.twoDigitsFormat(hours)
            : ((hours + 12 - 1) % 12) + 1;
        let formatedTime = (hour +
            ":" +
            this.twoDigitsFormat(minutes) +
            (suffix ? " " + suffix : "")).split(":");
        const isoDate = new Date(this.givenDate);
        isoDate.setHours(+formatedTime[0]);
        isoDate.setMinutes(+formatedTime[1], 0);
        return { iso: isoDate, formatedTime: formatedTime.join(":") };
    }
    midDay(time) {
        let eqt = this.sunPosition(this.jDate + time).equation;
        let noon = dmath_1.default.fixHour(12 - eqt);
        return noon;
    }
    sunAngleTime(angle, time, direction) {
        let decl = this.sunPosition(this.jDate + time).declination;
        let noon = this.midDay(time);
        let t = (1 / 15) *
            dmath_1.default.arccos((-dmath_1.default.sin(angle) - dmath_1.default.sin(decl) * dmath_1.default.sin(this.lat)) /
                (dmath_1.default.cos(decl) * dmath_1.default.cos(this.lat)));
        return noon + (direction == "ccw" ? -t : t);
    }
    asrTime(factor, time) {
        let decl = this.sunPosition(this.jDate + time).declination;
        let angle = -dmath_1.default.arccot(factor + dmath_1.default.tan(Math.abs(this.lat - decl)));
        return this.sunAngleTime(angle, time);
    }
    sunPosition(jd) {
        let D = jd - 2451545.0;
        let g = dmath_1.default.fixAngle(357.529 + 0.98560028 * D);
        let q = dmath_1.default.fixAngle(280.459 + 0.98564736 * D);
        let L = dmath_1.default.fixAngle(q + 1.915 * dmath_1.default.sin(g) + 0.02 * dmath_1.default.sin(2 * g));
        let e = 23.439 - 0.00000036 * D;
        let RA = dmath_1.default.arctan2(dmath_1.default.cos(e) * dmath_1.default.sin(L), dmath_1.default.cos(L)) / 15;
        let eqt = q / 15 - dmath_1.default.fixHour(RA);
        let decl = dmath_1.default.arcsin(dmath_1.default.sin(e) * dmath_1.default.sin(L));
        return { declination: decl, equation: eqt };
    }
    julian(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        let A = Math.floor(year / 100);
        let B = 2 - A + Math.floor(A / 4);
        let JD = Math.floor(365.25 * (year + 4716)) +
            Math.floor(30.6001 * (month + 1)) +
            day +
            B -
            1524.5;
        return JD;
    }
    compute(times) {
        times = this.dayPortion(times);
        let params = this.setting;
        let imsak = this.sunAngleTime(this.eval(params.imsak), times.imsak, "ccw");
        let fajr = this.sunAngleTime(this.eval(params.fajr), times.fajr, "ccw");
        let sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise, "ccw");
        let dhuhr = this.midDay(times.dhuhr);
        let asr = this.asrTime(this.asrFactor(params.asr), times.asr);
        let sunset = this.sunAngleTime(this.riseSetAngle(), times.sunset);
        let maghrib = this.sunAngleTime(this.eval(params.maghrib), times.maghrib);
        let isha = this.sunAngleTime(this.eval(params.isha), times.isha);
        return {
            imsak: imsak,
            fajr: fajr,
            sunrise: sunrise,
            dhuhr: dhuhr,
            asr: asr,
            sunset: sunset,
            maghrib: maghrib,
            isha: isha,
        };
    }
    adjustTimes(times) {
        let params = this.setting;
        for (let i in times)
            times[i] += this.timezone - this.lng / 15;
        if (this.isMin(params.imsak))
            times.imsak = times.fajr - this.eval(params.imsak) / 60;
        if (this.isMin(params.maghrib))
            times.maghrib = times.sunset + this.eval(params.maghrib) / 60;
        if (this.isMin(params.isha))
            times.isha = times.maghrib + this.eval(params.isha) / 60;
        times.dhuhr += this.eval(params.dhuhr) / 60;
        return times;
    }
    asrFactor(asrParam) {
        let factor = { Standard: 1, Hanafi: 2 }[asrParam];
        return factor || this.eval(asrParam);
    }
    riseSetAngle() {
        let angle = 0.0347 * Math.sqrt(this.elv);
        return 0.833 + angle;
    }
    tuneTimes(times) {
        for (let i in times)
            times[i] += this.offset[i] / 60;
        return times;
    }
    modifyFormats(times) {
        for (let i in times)
            times[i] = this.getFormattedTime(times[i], this.timeFormat);
        return times;
    }
    nightPortion(angle, night) {
        let method = this.setting.highLats;
        let portion = 1 / 2;
        if (method == "AngleBased")
            portion = (1 / 60) * angle;
        if (method == "OneSeventh")
            portion = 1 / 7;
        return portion * night;
    }
    dayPortion(times) {
        for (let i in times)
            times[i] /= 24;
        return times;
    }
    getTimeZone(date) {
        let year = date[0];
        let t1 = this.gmtOffset([year, 0, 1]);
        let t2 = this.gmtOffset([year, 6, 1]);
        return Math.min(t1, t2);
    }
    getDst(date) {
        return this.gmtOffset(date) != this.getTimeZone(date);
    }
    gmtOffset(date) {
        let localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
        let GMTString = localDate.toUTCString();
        let GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(" ") - 1));
        let hoursDiff = (localDate.getTime() - GMTDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff;
    }
    eval(str) {
        return +`${(str + "").split(/[^0-9.+-]/)[0]}`;
    }
    isMin(arg) {
        return (arg + "").indexOf("min") != -1;
    }
    timeDiff(time1, time2) {
        return dmath_1.default.fixHour(time2 - time1);
    }
    twoDigitsFormat(num) {
        return num < 10 ? "0" + num : num;
    }
}
exports.Adhan = Adhan;
//# sourceMappingURL=index.js.map