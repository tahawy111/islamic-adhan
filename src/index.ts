import DMath from "./dmath";

class Adhan {
  private methods: {
    MWL: { name: string; params: { fajr: number; isha: number } };
    ISNA: { name: string; params: { fajr: number; isha: number } };
    MF: { name: string; params: { fajr: number; isha: number } };
    Egypt: { name: string; params: { fajr: number; isha: number } };
    Makkah: { name: string; params: { fajr: number; isha: string } }; // fajr was 19 degrees before 1430 hijri
    Karachi: { name: string; params: { fajr: number; isha: number } };
    Tehran: {
      name: string;
      params: { fajr: number; isha: number; maghrib: number; midnight: string };
    }; // isha is not explicitly specified in this method
    Jafari: {
      name: string;
      params: { fajr: number; isha: number; maghrib: number; midnight: string };
    };
    JAKIM: { name: string; params: { fajr: number; isha: number } };
  };
  private defaultParams: { maghrib: string; midnight: string };
  private timeFormat: string;
  private timeSuffixes: string[];
  private invalidTime: string;
  private lat: any;
  private lng: any;
  private elv: any;
  private jDate: any;
  private givenDate: any;
  private defParams: { maghrib: string; midnight: string };
  private offset: {};
  private timeNames: {
    imsak: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    sunset: string;
    maghrib: string;
    isha: string;
    midnight: string;
  };
  private setting: {
    imsak: string;
    dhuhr: string;
    asr: string;
    highLats: string;
    midnight?: string;
    fajr?: string;
    maghrib?: string;
    isha?: string;
  };
  private timezone: any;
  constructor(private calcMethod: string = "MWL") {
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
      }, // fajr was 19 degrees before 1430 hijri
      Karachi: {
        name: "University of Islamic Sciences, Karachi",
        params: { fajr: 18, isha: 18 },
      },
      Tehran: {
        name: "Institute of Geophysics, University of Tehran",
        params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "Jafari" },
      }, // isha is not explicitly specified in  this method
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
    // interface ISettings {
    //   imsak: string;
    //   dhuhr: string;
    //   asr: string;
    //   highLats: string;
    //   midnight?: string;
    //   fajr?: string;
    //   maghrib?: string;
    //   isha?: string;
    // }

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
        if (typeof params[j] == "undefined") params[j] = this.defParams[j];
    }

    let params = this.methods[calcMethod].params;
    for (let id in params) this.setting[id] = params[id];

    for (let i in this.timeNames) this.offset[i] = 0;
  }

  //----------------------- Public Functions ------------------------

  // set calculation method
  protected setMethod(method: any) {
    if (this.methods[method]) {
      this.adjust(this.methods[method].params);
      this.calcMethod = method;
    }
  }

  // set calculating parameters
  protected adjust(params) {
    for (let id in params) this.setting[id] = params[id];
  }

  // set time offsets
  protected tune(timeOffsets) {
    for (let i in timeOffsets) this.offset[i] = timeOffsets[i];
  }

  // get current calculation method
  protected getMethod() {
    return this.calcMethod;
  }

  // get current setting
  protected getSetting() {
    return this.setting;
  }

  // get current time offsets
  protected getOffsets() {
    return this.offset;
  }

  // get default calc parametrs
  protected getDefaults() {
    return this.methods;
  }

  // return prayer times for a given date
  public getTimes(
    date: any,
    coords: any,
    timezone: any,
    dst?: any,
    format?: any
  ) {
    this.lat = coords[0];
    this.lng = coords[1];
    this.elv = coords[2] ? coords[2] : 0;
    this.givenDate = date;

    this.timeFormat = format || this.timeFormat;
    if (date.constructor === Date)
      date = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    if (typeof timezone == "undefined" || timezone == "auto")
      timezone = this.getTimeZone(date);
    if (typeof dst == "undefined" || dst == "auto") dst = this.getDst(date);
    this.timezone = timezone + (1 * dst ? 1 : 0);
    this.jDate = this.julian(date[0], date[1], date[2]) - this.lng / (15 * 24);

    return this.computeTimes();
  }

  // compute prayer times
  protected computeTimes() {
    // default times
    let times: ITimes = {
      imsak: 5,
      fajr: 5,
      sunrise: 6,
      dhuhr: 12,
      asr: 13,
      sunset: 18,
      maghrib: 18,
      isha: 18,
    };

    // main iterations
    times = this.compute(times);
    times = this.adjustTimes(times);

    interface ITimes {
      imsak: number;
      fajr: number;
      sunrise: number;
      dhuhr: number;
      asr: number;
      sunset: number;
      maghrib: number;
      isha: number;
      midnight?: number;
    }

    // add midnight time
    times.midnight =
      this.setting.midnight == "Jafari"
        ? times.sunset + this.timeDiff(times.sunset, times.fajr) / 2
        : times.sunset + this.timeDiff(times.sunset, times.sunrise) / 2;

    return this.modifyFormats(times);
  }

  // convert float time to the given format (see timeFormats)
  protected getFormattedTime(time, format, suffixes?) {
    if (isNaN(time)) return this.invalidTime;
    if (format == "Float") return time;
    suffixes = suffixes || this.timeSuffixes;

    time = DMath.fixHour(time + 0.5 / 60); // add 0.5 minutes to round
    let hours = Math.floor(time);
    let minutes = Math.floor((time - hours) * 60);
    let suffix = format == "12h" ? suffixes[hours < 12 ? 0 : 1] : "";
    let hour =
      format == "24h"
        ? this.twoDigitsFormat(hours)
        : ((hours + 12 - 1) % 12) + 1;

    let formatedTime = (
      hour +
      ":" +
      this.twoDigitsFormat(minutes) +
      (suffix ? " " + suffix : "")
    ).split(":");

    const isoDate = new Date(this.givenDate);
    isoDate.setHours(+formatedTime[0]);
    isoDate.setMinutes(+formatedTime[1], 0);

    return { iso: isoDate, formatedTime: formatedTime.join(":") };
  }

  //---------------------- Calculation Functions -----------------------

  // compute mid-day time
  protected midDay(time) {
    let eqt = this.sunPosition(this.jDate + time).equation;
    let noon = DMath.fixHour(12 - eqt);
    return noon;
  }

  // compute the time at which sun reaches a specific angle below horizon
  protected sunAngleTime(angle, time, direction?) {
    let decl = this.sunPosition(this.jDate + time).declination;
    let noon = this.midDay(time);
    let t =
      (1 / 15) *
      DMath.arccos(
        (-DMath.sin(angle) - DMath.sin(decl) * DMath.sin(this.lat)) /
          (DMath.cos(decl) * DMath.cos(this.lat))
      );
    return noon + (direction == "ccw" ? -t : t);
  }

  // compute asr time
  protected asrTime(factor, time) {
    let decl = this.sunPosition(this.jDate + time).declination;
    let angle = -DMath.arccot(factor + DMath.tan(Math.abs(this.lat - decl)));
    return this.sunAngleTime(angle, time);
  }

  // compute declination angle of sun and equation of time
  // Ref: http://aa.usno.navy.mil/faq/docs/SunApprox.php
  protected sunPosition(jd) {
    let D = jd - 2451545.0;
    let g = DMath.fixAngle(357.529 + 0.98560028 * D);
    let q = DMath.fixAngle(280.459 + 0.98564736 * D);
    let L = DMath.fixAngle(q + 1.915 * DMath.sin(g) + 0.02 * DMath.sin(2 * g));

    //     let R = 1.00014 - 0.01671 * DMath.cos(g) - 0.00014 * DMath.cos(2 * g);
    let e = 23.439 - 0.00000036 * D;

    let RA = DMath.arctan2(DMath.cos(e) * DMath.sin(L), DMath.cos(L)) / 15;
    let eqt = q / 15 - DMath.fixHour(RA);
    let decl = DMath.arcsin(DMath.sin(e) * DMath.sin(L));

    return { declination: decl, equation: eqt };
  }

  // convert Gregorian date to Julian day
  // Ref: Astronomical Algorithms by Jean Meeus
  protected julian(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    let A = Math.floor(year / 100);
    let B = 2 - A + Math.floor(A / 4);

    let JD =
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      B -
      1524.5;
    return JD;
  }

  //---------------------- Compute Prayer Times -----------------------

  // compute prayer times at given julian date
  protected compute(times) {
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

  // adjust times
  protected adjustTimes(times) {
    let params = this.setting;
    for (let i in times) times[i] += this.timezone - this.lng / 15;

    if (this.isMin(params.imsak))
      times.imsak = times.fajr - this.eval(params.imsak) / 60;
    if (this.isMin(params.maghrib))
      times.maghrib = times.sunset + this.eval(params.maghrib) / 60;
    if (this.isMin(params.isha))
      times.isha = times.maghrib + this.eval(params.isha) / 60;
    times.dhuhr += this.eval(params.dhuhr) / 60;

    return times;
  }

  // get asr shadow factor
  protected asrFactor(asrParam) {
    let factor = { Standard: 1, Hanafi: 2 }[asrParam];
    return factor || this.eval(asrParam);
  }

  // return sun angle for sunset/sunrise
  protected riseSetAngle() {
    //let earthRad = 6371009; // in meters
    //let angle = DMath.arccos(earthRad/(earthRad+ elv));
    let angle = 0.0347 * Math.sqrt(this.elv); // an approximation
    return 0.833 + angle;
  }

  // apply offsets to the times
  protected tuneTimes(times) {
    for (let i in times) times[i] += this.offset[i] / 60;
    return times;
  }

  // convert times to given time format
  protected modifyFormats(times) {
    for (let i in times)
      times[i] = this.getFormattedTime(times[i], this.timeFormat);
    return times;
  }

  // the night portion used for adjusting times in higher latitudes
  protected nightPortion(angle, night) {
    let method = this.setting.highLats;
    let portion = 1 / 2; // MidNight
    if (method == "AngleBased") portion = (1 / 60) * angle;
    if (method == "OneSeventh") portion = 1 / 7;
    return portion * night;
  }

  // convert hours to day portions
  protected dayPortion(times) {
    for (let i in times) times[i] /= 24;
    return times;
  }

  //---------------------- Time Zone Functions -----------------------

  // get local time zone
  protected getTimeZone(date) {
    let year = date[0];
    let t1 = this.gmtOffset([year, 0, 1]);
    let t2 = this.gmtOffset([year, 6, 1]);
    return Math.min(t1, t2);
  }

  // get daylight saving for a given date
  protected getDst(date) {
    return this.gmtOffset(date) != this.getTimeZone(date);
  }

  // GMT offset for a given date
  protected gmtOffset(date) {
    let localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
    let GMTString = localDate.toUTCString();
    let GMTDate = new Date(
      GMTString.substring(0, GMTString.lastIndexOf(" ") - 1)
    );
    let hoursDiff =
      (localDate.getTime() - GMTDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff;
  }

  //---------------------- Misc Functions -----------------------

  // convert given string into a number
  protected eval(str: string | any): number {
    return +`${(str + "").split(/[^0-9.+-]/)[0]}`;
  }

  // detect if input contains 'min'
  protected isMin(arg) {
    return (arg + "").indexOf("min") != -1;
  }

  // compute the difference between two times
  protected timeDiff(time1, time2) {
    return DMath.fixHour(time2 - time1);
  }

  // add a leading 0 if necessary
  protected twoDigitsFormat(num) {
    return num < 10 ? "0" + num : num;
  }
}

// const Prayer = new Adhan("Egypt");

// // Egypt, Alexandria;
// let latitude = 31.223;
// let longitude = 30.0355;

// const times: {
//   fajr: { iso: Date; formatedTime: string };
//   sunrise: { iso: Date; formatedTime: string };
//   dhuhr: { iso: Date; formatedTime: string };
//   asr: { iso: Date; formatedTime: string };
//   sunset: { iso: Date; formatedTime: string };
//   maghrib: { iso: Date; formatedTime: string };
//   isha: { iso: Date; formatedTime: string };
// } = Prayer.getTimes(
//   new Date() /* the Date */,
//   [latitude, longitude],
//   "auto" /* => timezone */
// );

// console.log(times.fajr.iso.toLocaleTimeString("en-eg"));

export { Adhan };
