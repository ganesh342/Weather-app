import {DateTime} from "luxon";
import {useState} from "react";
const API_KEY = '777a4b398daa4e67aea164151242007'
const BASE_URL =  'http://api.weatherapi.com/v1/'

const getWeatherData = (infoType, searchParams) =>{
    const url =new URL(BASE_URL + infoType)
    url.search = new URLSearchParams({ key: API_KEY , ...searchParams});

    return fetch(url).then((res) => res.json()).then((data) =>data);
};
function getTimezoneOffset(date, loc) {
    return new Intl.DateTimeFormat('en-US', { timeZone: loc, timeZoneName: "shortOffset" })
      .formatToParts(date)
      .filter(e => e.type === "timeZoneName")[0].value
  }

const iconUrlFromCode =(icon) => 'http:'+ icon;
const formatToLocalTime = (
    secs,
    offset,
    format= "cccc,dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs + offset ,{zone: "utc"}).toFormat(format);

const formatCurrent = (data) =>{
    const {
         location : {name,lat,lon,country,localtime,localtime_epoch,tz_id},
         current : {temp_c,feelslike_c,dewpoint_c,heatindex_c,humidity,condition,wind_mph},
         timezone,
    } = data;
    const {icon} = condition;
    const icons= iconUrlFromCode(icon);
    const {forecast} =data;
    const {forecastday} = forecast; 
    const sunrise= data.forecast.forecastday[0].astro.sunrise;
    const sunset= data.forecast.forecastday[0].astro.sunset;
    const val= (getTimezoneOffset(new Date(localtime_epoch*1000),tz_id));
    const d= new Date(localtime.slice(0,10));
    const day = d.getDay();
   const tzOffset = val.slice(-5);
    const [one,two]=(val[3]=='+')?tzOffset.split('+').map(Number):tzOffset.split('-').map(Number);
    const [hourOffset, minuteOffset] = (tzOffset[0]=='+' || tzOffset[0]=='-')?tzOffset.split(':').map(Number):[two,0];
    const Offset = (val[3]=='+')?(hourOffset * 60 + minuteOffset):(-hourOffset * 60 - minuteOffset);
    const local=formatToLocalTime(localtime_epoch,Offset*60);
    const daily = forecastday.map((f)=>({
        temp: f.day.avgtemp_c,
        title: formatToLocalTime(localtime_epoch,Offset*60,"cccc"),
        icon: iconUrlFromCode(f.day.condition.icon),
        date: f.date,
       }));
    const details = forecastday[0].day.condition.text;
    return {
        temp_c,feelslike_c,dewpoint_c,heatindex_c,humidity,details,country,sunrise,
        sunset,wind_mph,name,icons,local,timezone,lat,lon,day,daily
    };
}



const getFormattedWeatherData = async (searchParams) =>{
    const formattedCurrentWeather = await getWeatherData('forecast.json',{...searchParams,units:searchParams.units}).then(formatCurrent);
    return { ...formattedCurrentWeather};
}

export default getFormattedWeatherData;