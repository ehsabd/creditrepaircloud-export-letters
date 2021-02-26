
describe("Letter Parser", function () {
    const parseLetter = require('../../public/crc-letter-parser');

    it("Should parse state correctly", function () {
       const content= `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
       <p>Sample Client <br /> 1234 Main Street<br />Santa Monica, California 90401<br /> Date of Birth: 02/14/1963<br />SS#: 1111</p>
<p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
<p>01/25/2021</p>
<p>Re: Letter to Remove Inaccurate Credit Information</p>
<p>To Whom It May Concern:</p>
<p>I received a copy of my credit report and found the following item(s) to be in error:</p>`

        const output = parseLetter(content);
        expect (output.from.address_state).toEqual('California');
        expect (output.to.address_state).toEqual('PA');
        

    });
});