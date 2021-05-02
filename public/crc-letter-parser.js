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
            let m = lines[i].match(/^\s*(dob|date\s*of\s*birth)\s*:\s*(.*)$/i) 
            if (m!=null){
                return {value:m[2], index: i };
            }
        }
    }

    const findSSNumber = (lines) => {
        for (var i = 0; i < lines.length; i++) {
            let m = lines[i].match(/^[^0-9]+:([0-9\s]+)$/) 
            if (m!=null){
                return {value:m[1].trim(), index: i };
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
        for (let i=0;i<lines.length;i++){
            const m = lines[i].match(/(.*)\s*,\s*([a-zA-Z\s]*)([0-9]+)/);
            if (m!=null){
                console.log(m);
                return {index:i, value:{address_city : m[1]
                ,address_state : m[2].trim()
                ,address_zip : m[3]}};    
            }
        }       
    }

    const parseAddress = (lines) => {
        const lines_clone = [...lines];
        const cityStateZip = findCityStateZip(lines_clone);
        if (cityStateZip!=undefined){
            let out = cityStateZip.value;
            lines_clone.splice(cityStateZip.index);
            if (lines_clone.length>0){
                out.address_line1 = lines_clone.shift();
            }
            if (lines_clone.length>0){
                out.address_line2 = lines_clone[0];
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
    const afterdobssnumberindex = Math.max(dob.index, ssnumber.index)+1;
    const fromAddressLines = lines.slice(1, dob.index);
    console.log(fromAddressLines);
    const fromParsed = parseAddress(fromAddressLines);
    if (fromParsed){
        Object.assign(from, fromParsed.value);
        const letterDate = findLetterDate(lines, afterdobssnumberindex);
        if (!letterDate){
            throw new Error('Cannot find Letter Date');
        }
        to.name = lines[afterdobssnumberindex]
        const toAddressLines = lines.slice(afterdobssnumberindex+1,letterDate.index);
        console.log(toAddressLines);
        Object.assign(to, parseAddress(toAddressLines).value);    
    }else{ //Fallback mode, both addresses come after DOB/SS# 
        fallbackAddressLines = lines.slice(afterdobssnumberindex);
        const fallbackParsed = parseAddress(fallbackAddressLines);
        if (fallbackParsed){
            Object.assign(from, fallbackParsed.value);
            to.name = fallbackAddressLines[fallbackParsed.stopIndex+1];
            fallbackToAddressLines = fallbackAddressLines.slice(fallbackParsed.stopIndex+2);
            const fallbackToParsed = parseAddress(fallbackToAddressLines)
            Object.assign(to, fallbackToParsed.value);
            
        }else{
            throw new Error('Cannot find CityStateZip line')
        }
    }
    return {from:from, to:to, ssn:ssnumber.value, dob:dob.value};
}

if (typeof module !=='undefined') module.exports = parseLetter;
