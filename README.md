# Adhan.ts

` It's a Function returns Pray times or adhan times in any place in the world`

# Installation

`npm install --save islamic-adhan`
or
`yarn add --save islamic-adhan`

# How To Use

1. You Must Know Your `lattitude & longitude`.
2. You Must Know Your time zone number for example `2 refres to gmt+2 & 3 refers to gmt+3....` but if you are in this location you don't have to add time zone you can leave it `"auto"`.
3. You Must Know your calculation method for your region & country. to know search on google. for example `What is the salah calculation method for Egypt`

## Our Calculation Methods

```typescript
{
    MWL: {
      name: "Muslim World League",
      params: { fajr: 18, isha: 17 },
    },
    ISNA: {
      name: "Islamic Society of North America (ISNA)",
      params: { fajr: 15, isha: 15 },
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
    }, // isha is not explicitly specified in this method
    Jafari: {
      name: "Shia Ithna-Ashari, Leva Institute, Qum",
      params: { fajr: 16, isha: 14, maghrib: 4, midnight: "Jafari" },
    },
  }
```

# Examples

if you got those three data ? you will get the prayer times accurately

## Example 1

```typescript
import { Adhan } from "adhan.ts";

const Prayer = new Adhan("Egypt");

// Egypt, Alexandria;
let latitude = 31.223;
let longitude = 30.0355;

const times = Prayer.getTimes(
  new Date() /* the Date */,
  [latitude, longitude],
  "auto" /* => timezone */
);

console.log(times);
```

### Output

```
{
  imsak: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '06:15' },
  fajr: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '06:25' },
  sunrise: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '07:56' },
  dhuhr: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '13:12' },
  asr: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '16:09' },
  sunset: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '18:29' },
  maghrib: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '18:29' },
  isha: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '19:51' },
  midnight: { iso: 2023-01-25T23:12:00.495Z, formatedTime: '01:12' }
}
```

## Example 2

```typescript
import { Adhan } from "adhan.ts";

const Prayer = new Adhan("Egypt");

// Jordan, Oman;
let latitude = 31.95806;
let longitude = 35.93528;

const times = Prayer.getTimes(
  new Date() /* the Date */,
  [latitude, longitude],
  "auto" /* => timezone */
);
```

### Output

```
{
  imsak: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '05:57' },
  fajr: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '06:07' },
  sunrise: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '07:33' },
  dhuhr: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '12:49' },
  asr: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '15:44' },
  sunset: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '18:04' },
  maghrib: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '18:04' },
  isha: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '19:34' },
  midnight: { iso: 2023-01-25T22:49:00.834Z, formatedTime: '00:49' }
}
```
