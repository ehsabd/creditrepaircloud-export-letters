const { globalAgent } = require('http');

describe("Letter Formatter", () => {
    global.parseLetter =  require('../../public/crc-letter-parser'); //load into global to emulate content scripts on browser
    const formatLetter = require('../../public/crc-letter-formatter');
    it("Should return the content when format is none",  () => {

        const content = 'Example Content';
        expect(formatLetter(content)).toEqual(content);

    });

    it("Should return the LOB formatted content when format is lob", () => {
        const tests = [[
        `<p>Sample Client <br />
        1234 Main Street<br />Santa Monica, California 12345<br />
        Date of Birth: 02/14/1963<br />SS#: 1111</p>
       <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
       <p>01/25/2021</p>
       <p>Re: Letter to Remove Inaccurate Credit Information</p>
       <p>To Whom It May Concern:</p>
       <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`,
       `${'<br>'.repeat(11)}
        <p>Date of Birth: 02/14/1963<br />SS#: 1111</p>
        <p>01/25/2021</p>
       <p>Re: Letter to Remove Inaccurate Credit Information</p>
       <p>To Whom It May Concern:</p>
       <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`
    ], [
        `<p>Sample Client <br />
        1234 Main Street<br />Santa Monica-California 12345<br />
        Date of Birth: 02/14/1963<br />SS#: 1111</p>
       <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester-PA 45678</p>
       <p>01/25/2021</p>
       <p>Re: Letter to Remove Inaccurate Credit Information</p>
       <p>To Whom It May Concern:</p>
       <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`,
       `${'<br>'.repeat(11)}
        <p>Date of Birth: 02/14/1963<br />SS#: 1111</p>
        <p>01/25/2021</p>
       <p>Re: Letter to Remove Inaccurate Credit Information</p>
       <p>To Whom It May Concern:</p>
       <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`
    ]];

        tests.forEach((item)=>{
            expect(formatLetter(item[0], 'lob')).toEqual(item[1]);
        })

    })

    it("Should keep breaks in formatted content when format is lob", () => {
        //TODO add test;
    })
})