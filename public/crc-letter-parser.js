


const parseLetter = (content) => {
    console.log(content);
    /*
    From https://stackoverflow.com/a/50949805 CC BY-SA 4.0
    */
    const fixEncodedWhitespace = (str) => {
        var elem = document.createElement("textarea");
        elem.innerHTML = str;
        return elem.value.trim();     
    }


    const findDob = (lines) => {
        return {
            index: 3, //TODO: fix this    

            value: lines[3].split(':')[1].trim()
        }
    }

    const findSSNumber = (lines) => {
        for (var i = 0; i < lines.length; i++) {
            if (/^[^0-9]+:[0-9\s]+$/.test(lines[i])) {
                return { index: i };
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

    const parseAddress = (lines) => {
        let out = {}
        const lastLine = lines.pop();
        const m = lastLine.match(/(.*),\s*([a-zA-Z]*)\s*([0-9]*)/);
        if (m!=null){
            out.address_city = m[1];
            out.address_state = m[2];
            out.address_zip = m[3];    
        }
        if (lines.length>0){
            out.address_line1 = lines.shift();
        }
        if (lines.length>0){
            out.address_line2 = lines[0];
        }
        return out;
    }

    content = fixEncodedWhitespace(content); // to make things like &nbsp regular whitespaces
    const delimiterRegex = /(<p>|<br[^>]*>|<\/p>)/g;
    let lines = content
        .split(delimiterRegex)
        .map((l) => l.replace(delimiterRegex, '').replace(/<[/]*div[^>]*>/g, '').trim())
        .filter((l) => l.length > 0);
    console.log(lines)
    // parse letter content (sender, receiver , etc.)
    let from = {address_country:'US'};
    let to = {address_country:'US'};
    from.name = lines[0];
    const dob = findDob(lines);
    const ssnumber = findSSNumber(lines);
    const fromAddressLines = lines.slice(1, dob.index);
    console.log(fromAddressLines);
    Object.assign(from, parseAddress(fromAddressLines));
    const letterDate = findLetterDate(lines, ssnumber.index+1);
    to.name = lines[ssnumber.index+1]
    const toAddressLines = lines.slice(ssnumber.index+2,letterDate.index);
    console.log(toAddressLines);
    Object.assign(to, parseAddress(toAddressLines));
    return {from:from, to:to};
}
