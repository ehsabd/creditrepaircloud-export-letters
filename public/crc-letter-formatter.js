const findIndexOfLetterDate = (content) => {
    const dateregex = /(<br \/>|<p>)\s*[0-9]+\/[0-9]+\/[0-9]{4}/;
    m = content.match(dateregex)
    if (m == null){
        throw new Error('Cannot find LetterDate')
    }
    return m.index;
}

const formatLetter = (content, format) => {
    if (format === 'lob'){
        const parsedLetter = parseLetter(content);
        const letterDateIndex = findIndexOfLetterDate(content);
        return content.substring(0, letterDateIndex) + 
        `<p>Date of Birth: ${parsedLetter.dob}<br />SS#: ${parsedLetter.ssn}</p>` +
        content.substring(letterDateIndex); 
    }
    return content;
}


if (typeof module !=='undefined') module.exports = formatLetter;