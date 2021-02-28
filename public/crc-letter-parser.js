const parseLetter = (content) => {
    let doc = null;
    if (typeof document === 'undefined'){
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;
        const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
        doc = dom.window.document;    
    }else{
        doc = document;
    }

    console.log(content);
    /*
    From https://stackoverflow.com/a/50949805 CC BY-SA 4.0
    */
    const fixEncodedWhitespace = (str) => {
        var elem = doc.createElement("textarea");
        elem.innerHTML = str;
        return elem.value.trim();     
    }


    const findDob = (lines) => {
        for (var i = 0; i < lines.length; i++) {
            let m = lines[i].match(/^\s*(dob|date\s*of\s*birth)\s*:(.*)$/i) 
            if (m!=null){
                return {value:m[2], index: i };
            }
        }
    }

    const findSSNumber = (lines) => {
        for (var i = 0; i < lines.length; i++) {
            let m = lines[i].match(/^[^0-9]+:([0-9\s]+)$/) 
            if (m!=null){
                return {value:m[1], index: i };
            }
        }
    }

    const findLetterDate = (lines, startIndex) => {
        for (var i = startIndex || 0; i < lines.length; i++) {
            if (/^[0-9]+\/[0-9]+\/[0-9]{4}$/.test(lines[i])) {
                return { index: i };
            }
        }
    }

    const findCityStateZip = (lines) =>{
        for (let i=lines.length-1;i>=0;i--){
            const m = lines[i].match(/(.*)\s*,\s*([a-zA-Z\s]*)([0-9]*)/);
            if (m!=null){
                console.log(m);
                return {index:i, value:{address_city : m[1]
                ,address_state : m[2].trim()
                ,address_zip : m[3]}};    
            }
        }       
    }

    const parseAddress = (lines) => {
        const cityStateZip = findCityStateZip(lines);
        if (cityStateZip!=undefined){
            let out = cityStateZip.value;
            lines.splice(cityStateZip[0]);
            if (lines.length>0){
                out.address_line1 = lines.shift();
            }
            if (lines.length>0){
                out.address_line2 = lines[0];
            }
            return {stopIndex: cityStateZip.index, value:out};
        }
    }

    content = fixEncodedWhitespace(content); // to make things like &nbsp regular whitespaces
    const delimiterRegex = /(<p>|<br[^>]*>|<\/p>)/g;
    let lines = content
        .split(delimiterRegex)
        .map((l) => l.replace(delimiterRegex, '').replace(/<[/]*div[^>]*>/g, '').trim())
        .filter((l) => l.length > 0);
    console.log(JSON.stringify(lines))
    // parse letter content (sender, receiver , etc.)
    let from = {address_country:'US'};
    let to = {address_country:'US'};
    from.name = lines[0];
    const dob = findDob(lines);
    const ssnumber = findSSNumber(lines);
    const fromAddressLines = lines.slice(1, dob.index);
    console.log(fromAddressLines);
    Object.assign(from, parseAddress(fromAddressLines).value);
    const letterDate = findLetterDate(lines, ssnumber.index+1);
    to.name = lines[ssnumber.index+1]
    const toAddressLines = lines.slice(ssnumber.index+2,letterDate.index);
    console.log(toAddressLines);
    Object.assign(to, parseAddress(toAddressLines).value);
    return {from:from, to:to, ssn:ssnumber.value};
}

module.exports = parseLetter;
