
describe("Letter Parser", function () {
    const parseLetter = require('../../public/crc-letter-parser');
    
    it("Should parse the letter correctly with the standard format", function () {

        const item = {
            content: `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
            <p>Sample Client <br />
             1234 Main Street<br />Santa Monica, California 90401<br />
             Date of Birth: 02/14/1963<br />SS#: 1111</p>
            <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
            <p>01/25/2021</p>
            <p>Re: Letter to Remove Inaccurate Credit Information</p>
            <p>To Whom It May Concern:</p>
            <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`,
            from: { address_state: 'California' },
            to: { address_state: 'PA' }
        }; 
        const output = parseLetter(item.content);
        expect(output.from.address_state).toEqual(item.from.address_state);
        expect(output.to.address_state).toEqual(item.to.address_state);
    



    });

    it("Should parse the letter correctly when the destination address has an extra line", function () {

        const item =  {
            content: `<p>Sonya Beavers</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> Date of Birth: ---</p>
            <p> SS#: 1113</p>
            <p> Dest Name2</p>
            <p> PO Box 2000</p>
            <p> Chester, PA 12345</p>
            <p> Attn: Fraud Department</p>
            <p> 01/01/2021</p>
            <p> <span> To Whom It May Concern,</span></p>`,
            from: { address_state: 'California' },
            to: { address_state: 'PA' }
        };
        const output = parseLetter(item.content);
        expect(output.from.address_state).toEqual(item.from.address_state);
        expect(output.to.address_state).toEqual(item.to.address_state);
    });

    it("Should parse the letter correctly when the SS# comes before Date of Birth", function () {

        const item =  {
            content: `<p>Sonya Beavers</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> SS#: 1113</p>
            <p> Date of Birth: ---</p>
            <p> Dest Name2</p>
            <p> PO Box 2000</p>
            <p> Chester, PA 12345</p>
            <p> Attn: Fraud Department</p>
            <p> 01/01/2021</p>
            <p> <span> To Whom It May Concern,</span></p>`,
            from: { address_state: 'California' },
            to: { address_state: 'PA' }
        };
        const output = parseLetter(item.content);
        expect(output.from.address_state).toEqual(item.from.address_state);
        expect(output.to.address_state).toEqual(item.to.address_state);
    });

    it("Should parse the letter correctly when the SS# comes before Date of Birth and both addresses after Date of Birth", function () {

        const item = {
            content: `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
            <p>John Doe
            <br />SS#: 1111
            <br />
            Date of Birth: 01/01/1983&nbsp;
            <br />1234 Jibgy Drive AXN 1234
            <br />Roseville, California 12345
            <br /><br />Transunion&nbsp;
            <br />TransUnion LLC Consumer Dispute Center
            <br /> PO Box 2000
            <br /> Chester, PA 19016&nbsp;
            <br />
            <br />
            <br />01/01/2021&nbsp;<br />
            <br />
            <br />To whom it may concern</p>`,
            from: { address_state: 'California' },
            to: { address_state: 'PA' }
        }
        const output = parseLetter(item.content);
        expect(output.from.address_state).toEqual(item.from.address_state);
        expect(output.to.address_state).toEqual(item.to.address_state);
    });
});