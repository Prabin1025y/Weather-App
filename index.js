import fs from 'fs';
import http from 'http';
import requests from 'requests';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainHTML = fs.readFileSync("index.html", "utf-8");
let sunIconSrc;
const locationIconSrc = `${__dirname}\\svg\\location.svg`;

const server = http.createServer((req, res) => {

    requests('https://api.openweathermap.org/data/2.5/weather?q=london&appid=36fd9d1f8482231c4d4404b7ffaf7d17&units=metric')
        .on('data', function (chunk) {
            // console.log(chunk);
            if (req.url == "/")
                res.write(updateHTML(JSON.parse(chunk)));
            else {
                res.writeHead(404, { "content-type": "text/html" });
                res.end("<h1>Error 404. No such page exists</h1>");
            }
        })
        .on('end', function (err) {
            if (err) return console.log('connection closed due to errors', err);
            res.end();
            console.log('end');
        });
});

server.listen(8000, "127.0.0.1", (err) => {
    if (err) console.log(err);
    else
        console.log("Successfully connected to port 8000");
});

let updateHTML = (apiData) => {
    let updatedHTML = mainHTML;
    let uiInfo = JSON.parse(fs.readFileSync("weather.json","utf-8"))
    console.log(uiInfo);
    updatedHTML = updatedHTML.replace("{%temperatureValue%}", Math.round(apiData.main.temp));
    updatedHTML = updatedHTML.replace("{%weather%}", apiData.weather[0].description);
    updatedHTML = updatedHTML.replace("{%feelLikeTemp%}", Math.round(apiData.main.feels_like));
    updatedHTML = updatedHTML.replace("{%cityName%}", apiData.name);
    updatedHTML = updatedHTML.replace("{%countryCode%}", apiData.sys.country);
    updatedHTML = updatedHTML.replace("{%locationIcon%}", fs.readFileSync("svg/location.svg"));
    // updatedHTML = updatedHTML.replace("{%weatherIcon%}", fs.readFileSync(`svg/${apiData.weather[0].main}.svg`));

    uiInfo.forEach(element => {
        if(element.name === apiData.weather[0].main){
            updatedHTML = updatedHTML.replace("{%weatherIcon%}", fs.readFileSync(element.icon));
            updatedHTML = updatedHTML.replace("{%iconAnimationClass%}", element.animationClass);
            updatedHTML = updatedHTML.replace("{%themeColor%}", element.themeColor);
        }
    });


    // if (apiData.weather[0].main === "Clear")
    //     updatedHTML = updatedHTML.replace("{%iconAnimationClass%}", "rotateIcon");
    // else
    //     updatedHTML = updatedHTML.replace("{%iconAnimationClass%}", "moveLeftRightAnim");

    // switch (apiData.weather[0].main) {
    //     case "Clear":
    //         updatedHTML = updatedHTML.replace("{%themeColor%}", "#ffc518");
    //         break;
    //     case "Clouds":
    //         updatedHTML = updatedHTML.replace("{%themeColor%}", "#03C4F2");
    //         break;
    //     case "Rain":
    //         updatedHTML = updatedHTML.replace("{%themeColor%}", "#2f2855");
    //         break;
    //     default:
    //         break;
    // }

    return updatedHTML;
}

