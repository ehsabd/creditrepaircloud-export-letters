
describe("Letter Parser", function () {
    const parseLetter = require('../../public/crc-letter-parser');
    
    it("Should parse the letter correctly with the standard format", function () {

            content= `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
            <p>Sample Client <br />
             1234 Main Street<br />Santa Monica, California 90401<br />
             Date of Birth: 02/14/1963<br />SS#: 1111</p>
            <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
            <p>01/25/2021</p>
            <p>Re: Letter to Remove Inaccurate Credit Information</p>
            <p>To Whom It May Concern:</p>
            <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`
        
        const output = parseLetter(content);
        expect(output).toEqual({
            from: {
              address_country: 'US',
              name: 'Sample Client',
              address_city: 'Santa Monica',
              address_state: 'California',
              address_zip: '90401',
              address_line1: '1234 Main Street'
            },
            to: {
              address_country: 'US',
              name: 'TransUnion LLC Consumer Dispute Center',
              address_city: 'Chester',
              address_state: 'PA',
              address_zip: '45678',
              address_line1: 'PO Box 2000'
            },
            ssn: ' 1111'
          });
    



    });

    it("Should parse the letter correctly when the destination address has an extra line", function () {

            content = `<p>Sample Client</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> Date of Birth: ---</p>
            <p> SS#: 1113</p>
            <p> Dest Name2</p>
            <p> PO Box 2000</p>
            <p> Chester, PA 12345</p>
            <p> Attn: Fraud Department</p>
            <p> 01/01/2021</p>
            <p> <span> To Whom It May Concern,</span></p>`;
       
        const output = parseLetter(content);
        expect(output).toEqual({
            from: {
              address_country: 'US',
              name: 'Sample Client',
              address_city: 'San Francisco',
              address_state: 'California',
              address_zip: '23456',
              address_line1: '1111 McKinnon Avenue APT 3333'       
            },
            to: {
              address_country: 'US',
              name: 'Dest Name2',
              address_city: 'Chester',
              address_state: 'PA',
              address_zip: '12345',
              address_line1: 'PO Box 2000'
            },
            ssn: ' 1113'
          });
    });

    it("Should parse the letter correctly when the SS# comes before Date of Birth", function () {

            content = `<p>Sample Client</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> SS#: 1113</p>
            <p> Date of Birth: ---</p>
            <p> Dest Name2</p>
            <p> PO Box 2000</p>
            <p> Chester, PA 12345</p>
            <p> Attn: Fraud Department</p>
            <p> 01/01/2021</p>
            <p> <span> To Whom It May Concern,</span></p>`;

        const output = parseLetter(content);
        expect(output).toEqual({
            from: {
              address_country: 'US',
              name: 'Sample Client',
              address_city: 'San Francisco',
              address_state: 'California',
              address_zip: '23456',
              address_line1:'1111 McKinnon Avenue APT 3333'
            },
            to: {
              address_country: 'US',
              name: 'Dest Name2',
              address_city: 'Chester',
              address_state: 'PA',
              address_zip: '12345',
              address_line1:'PO Box 2000'
            },
            ssn: ' 1113'
          });
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