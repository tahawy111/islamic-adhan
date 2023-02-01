declare class Adhan {
    private calcMethod;
    private methods;
    private defaultParams;
    private timeFormat;
    private timeSuffixes;
    private invalidTime;
    private lat;
    private lng;
    private elv;
    private jDate;
    private givenDate;
    private defParams;
    private offset;
    private timeNames;
    private setting;
    private timezone;
    constructor(calcMethod?: string);
    protected setMethod(method: any): void;
    protected adjust(params: any): void;
    protected tune(timeOffsets: any): void;
    protected getMethod(): string;
    protected getSetting(): {
        imsak: string;
        dhuhr: string;
        asr: string;
        highLats: string;
        midnight?: string | undefined;
        fajr?: string | undefined;
        maghrib?: string | undefined;
        isha?: string | undefined;
    };
    protected getOffsets(): {};
    protected getDefaults(): {
        MWL: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
        ISNA: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
        MF: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
        Egypt: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
        Makkah: {
            name: string;
            params: {
                fajr: number;
                isha: string;
            };
        };
        Karachi: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
        Tehran: {
            name: string;
            params: {
                fajr: number;
                isha: number;
                maghrib: number;
                midnight: string;
            };
        };
        Jafari: {
            name: string;
            params: {
                fajr: number;
                isha: number;
                maghrib: number;
                midnight: string;
            };
        };
        JAKIM: {
            name: string;
            params: {
                fajr: number;
                isha: number;
            };
        };
    };
    getTimes(date: any, coords: any, timezone: any, dst?: any, format?: any): any;
    protected computeTimes(): any;
    protected getFormattedTime(time: any, format: any, suffixes?: any): any;
    protected midDay(time: any): number;
    protected sunAngleTime(angle: any, time: any, direction?: any): number;
    protected asrTime(factor: any, time: any): number;
    protected sunPosition(jd: any): {
        declination: number;
        equation: number;
    };
    protected julian(year: any, month: any, day: any): number;
    protected compute(times: any): {
        imsak: number;
        fajr: number;
        sunrise: number;
        dhuhr: number;
        asr: number;
        sunset: number;
        maghrib: number;
        isha: number;
    };
    protected adjustTimes(times: any): any;
    protected asrFactor(asrParam: any): any;
    protected riseSetAngle(): number;
    protected tuneTimes(times: any): any;
    protected modifyFormats(times: any): any;
    protected nightPortion(angle: any, night: any): number;
    protected dayPortion(times: any): any;
    protected getTimeZone(date: any): number;
    protected getDst(date: any): boolean;
    protected gmtOffset(date: any): number;
    protected eval(str: string | any): number;
    protected isMin(arg: any): boolean;
    protected timeDiff(time1: any, time2: any): number;
    protected twoDigitsFormat(num: any): any;
}
export { Adhan };
