
describe("Letter Parser", function () {
    const parseLetter = require('../../public/crc-letter-parser');
    const tests = [{
        content: `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
        <p>Sample Client <br /> 1234 Main Street<br />Santa Monica, California 90401<br /> Date of Birth: 02/14/1963<br />SS#: 1111</p>
        <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
        <p>01/25/2021</p>
        <p>Re: Letter to Remove Inaccurate Credit Information</p>
        <p>To Whom It May Concern:</p>
        <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`,
        from: { address_state: 'California' },
        to: { address_state: 'PA' }
    },
    {
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
    },
    {
        content: `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
        <p>John Doe<br />SS#: 1111<br />Date of Birth: 01/01/1983&nbsp;<br />1234 Jibgy Drive AXN 1234<br />Roseville, California 12345<br /><br />Transunion&nbsp;<br />TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 19016&nbsp;<br /><br /><br />01/01/2021&nbsp;<br /><br /><br />To whom it may concern</p>`,
        from: { address_state: 'California' },
        to: { address_state: 'PA' }
    }
    ];

    it("Should parse state correctly", function () {

        tests.forEach((item) => {
            const output = parseLetter(item.content);
            console.log(output);
            expect(output.from.address_state).toEqual(item.from.address_state);
            expect(output.to.address_state).toEqual(item.to.address_state);
        })



    });
});