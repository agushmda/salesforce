const express = require('express');
const {google} = require('googleapis');
const path = require('path');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) =>{
    res.render("index")
})

app.post('/', async (req, res) => {


    //GOOGLE SHEETS AUTENTICATION PROCESS

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
        
    });

    //Create client instance
    const client = await auth.getClient();

    //Create google sheet api
    const googleSheets = google.sheets({version: 'v4', auth: client});


    const spreadsheetId = '1_ARv-YrLIKix03382X-VAaO_WxKF07hYvdsD-z-gsuc'

    // Input values logic

    const { inputValue } = req.body;

    const espacio = " ";
    
    let automationId = inputValue.split(espacio);
    
    
    // Ad date logic
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    let today = new Intl.DateTimeFormat('en-US').format(date)
//    let today = `${mm}/${dd}/${yy}`;


    function compareDates (d1, d2) {
        if (Date.parse(d1) > Date.parse(d2)) {
            return d1
        } else {
            return d2
        }
    }

    //Get metadata about sheet
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });


    //Read rows from sheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Media Plan'
    })

    //Get values from rows
    const sheetValues = getRows.data.values;
    
    //Filter values per campaign

    let mappedArray = sheetValues.filter(elem => {
        for (let i=0; i < automationId.length; i++){
            if (elem[29] === automationId[i]){
                let dataArray = {};
                for(let i=0; i < 46; i++){
                    dataArray.i = elem[i]
                }
                return dataArray;
            }
        }
    })

    //Write genesis
    for (i=0; i < mappedArray.length; i++){
        
        await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Genesis",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [
                [mappedArray[i][29], "", mappedArray[i][39], "", "", "", "", "", "", mappedArray[i][43], compareDates(mappedArray[i][31], today), mappedArray[i][32], "CPM", "", "", "", mappedArray[i][24] == "Tracking Tag" ? "1x1" : mappedArray[i][23], "", mappedArray[i][43], mappedArray[i][24] == "Tracking Tag" ? "Tracking_Ad" : mappedArray[i][9], compareDates(mappedArray[i][31], today) + " 12:00 AM", mappedArray[i][32] + " 11:59 PM", "No", "Even", "", mappedArray[i][45], mappedArray[i][30]],
            ]
        }
    })
    }
     res.redirect("/");

});

app.listen(process.env.PORT || 1337, () => console.log('running on 1337'));
