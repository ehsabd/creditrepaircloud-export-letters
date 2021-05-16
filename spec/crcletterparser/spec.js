
describe("Letter Parser", function () {
    const parseLetter = require('../../public/crc-letter-parser');
    
    it("Should parse the letter correctly with the standard format", function () {

        tests = [[`<div class="pageBreak" style="page-break-after:always; display: inline-block;">
            <p>Sample Client <br />
             1234 Main Street<br />Santa Monica, California 12345<br />
             Date of Birth: 01/01/1963<br />SS#: 1111</p>
            <p>TransUnion LLC Consumer Dispute Center<br /> PO Box 2000<br /> Chester, PA 45678</p>
            <p>01/25/2021</p>
            <p>Re: Letter to Remove Inaccurate Credit Information</p>
            <p>To Whom It May Concern:</p>
            <p>I received a copy of my credit report and found the following item(s) to be in error:</p>`,
            {
              from: {
                address_country: 'US',
                name: 'Sample Client',
                address_city: 'Santa Monica',
                address_state: 'California',
                address_zip: '12345',
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
              ssn: '1111',
              dob: '01/01/1963'
            }],
            [`<p>Martin Martinez</p>
            <p>123 Hammershire Road, Reisterstown, MD, USA</p>
            <p>Reisterstown, Maryland 12345</p>
            <p>Date of Birth: 01/01/1990</p>
            <p>SS#: 2222</p>
            
            <p>Experian</p>
            <p>P.O. Box 4500</p>
            <p>Allen, TX 45678</p>
            
            <p>01/01/2021</p>
            
            <p>Re: Letter to Remove Inaccurate Credit Information</p>
            
            <p>To Whom It May Concern:</p>`,
            {
              from: {
                address_country: 'US',
                name: 'Martin Martinez',
                address_city: 'Reisterstown',
                address_state: 'Maryland',
                address_zip: '12345',
                address_line1: '123 Hammershire Road, Reisterstown, MD, USA'
              },
              to: {
                address_country: 'US',
                name: 'Experian',
                address_city: 'Allen',
                address_state: 'TX',
                address_zip: '45678',
                address_line1: 'P.O. Box 4500'
              },
              ssn: '2222',
              dob: '01/01/1990'
            }
          ],
          ['<div class="pageBreak" style="page-break-after:always; display: inline-block;">        <p>John Doe<br />1111 Bamargosa Thrive<br />Antioch, California 12345<br />Date of Birth: 01/23/1980<br />SS#: 2222</p><p>CAPITAL ONE<br />4567 Capital One Dr<br />McLean, VA 45678</p><p>01/01/2021</p><p>ATTN: John J. Doe <br />(123) 456-7890<br />johnjdoedoe@capitalone.com</p><p>Regarding: Account No:&nbsp;<span>1111111<br /></span></p><p>To Whom It May Concern:</p>',
        
          {
            from: {
              address_country: 'US',
              name: 'John Doe',
              address_city: 'Antioch',
              address_state: 'California',
              address_zip: '12345',
              address_line1: '1111 Bamargosa Thrive'
            },
            to: {
              address_country: 'US',
              name: 'CAPITAL ONE',
              address_city: 'McLean',
              address_state: 'VA',
              address_zip: '45678',
              address_line1: '4567 Capital One Dr'
            },
            ssn: '2222',
            dob: '01/23/1980'
          }]
        ]
        tests.forEach((item)=>{
          expect(parseLetter(item[0])).toEqual(item[1]);
        })


    });

    it("Should parse the letter correctly when the destination address has an extra line", function () {

            content = `<p>Sample Client</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> Date of Birth: 01/01/1963</p>
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
            ssn: '1113',
            dob: '01/01/1963'
          });
    });

    it("Should parse the letter correctly when the SS# comes before Date of Birth", function () {

            content = `<p>Sample Client</p>
            <p>1111 McKinnon Avenue APT 3333</p>
            <p> San Francisco, California 23456</p>
            <p> SS#: 1113</p>
            <p> Date of Birth: 01/01/1963</p>
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
            ssn: '1113',
            dob:'01/01/1963'
          });
    });

    it("Should parse the letter correctly when there is no Date of Birth", function () {

      content = `<p>Sample Client</p>
      <p>1111 McKinnon Avenue APT 3333</p>
      <p> San Francisco, California 23456</p>
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
          ssn: '1113'
        });
    });

    it("Should parse the letter correctly when the SS# comes before Date of Birth and both addresses after Date of Birth", function () {

            content= `<div class="pageBreak" style="page-break-after:always; display: inline-block;">
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
            <br />To whom it may concern</p>`;
        
        const output = parseLetter(content);
        expect(output).toEqual({
            from: {
              address_country: 'US',
              name: 'John Doe',
              address_city: 'Roseville',
              address_state: 'California',
              address_zip: '12345',
              address_line1:'1234 Jibgy Drive AXN 1234'
            },
            to: {
              address_country: 'US',
              name: 'Transunion',
              address_city: 'Chester',
              address_state: 'PA',
              address_zip: '19016',
              address_line1: 'TransUnion LLC Consumer Dispute Center',
              address_line2: 'PO Box 2000'
            },
            ssn: '1111',
            dob: '01/01/1983'
          });
    });

  
    it("Should raise the error can't find the Letter Date when it can't find such line", function () {

      content= `<div class="pageBreak" style="page-break-after:always; display: inline-block;">        <p>John Doe<br />1111 Bamargosa Thrive<br />Antioch, California 12345<br />Date of Birth: 01/23/1980<br />SS#: 2222</p><p>CAPITAL ONE<br />4567 Capital One Dr<br />McLean, VA 45678</p><p>01//01/2021</p><p>ATTN: John J. Doe <br />(123) 456-7890<br />johnjdoedoe@capitalone.com</p><p>Regarding: Account No:&nbsp;<span>1111111<br /></span></p><p>To Whom It May Concern:</p>`;
  
 
  expect(()=>{parseLetter(content)}).toThrow(new Error('Cannot find Letter Date'));
    });

    it("Should return empty addresses when the sender address is entered in a non-supported format", function () {

      content = `<p>Sample Client</p>
      <p>1111 McKinnon-Avenue APT 3333</p>
      <p> San Francisco-California-23456</p>
      <p> Date of Birth: 01/01/1963</p>
      <p> SS#: 1113</p>
      <p> Dest Name2</p>
      <p> PO Box 2000</p>
      <p> Chester, PA 12345</p>
      <p> 01/01/2021</p>
      <p> <span> To Whom It May Concern,</span></p>`;
 
  const output = parseLetter(content);
  expect(output).toEqual({
      from: {
        address_country: 'US',
        name: 'Sample Client',       
      },
      to: {
        address_country: 'US',
      },
      ssn: '1113',
      dob: '01/01/1963'
    });
  });

  it("Should return empty addresses when the destination address is entered in a non-supported format", function () {

    const tests = [[`<p>Sample Client</p>
      <p>1111 McKinnon Avenue APT 3333</p>
      <p> San Francisco, California 23456</p>
      <p> Date of Birth: 01/01/1963</p>
      <p> SS#: 1113</p>
      <p> Dest Name2</p>
      <p> PO Box2000</p>
      <p> Chester-PA-12345</p>
      <p> 01/01/2021</p>
      <p> <span> To Whom It May Concern,</span></p>`,{
        from: {
          address_country: 'US',
          name: 'Sample Client',       
        },
        to: {
          address_country: 'US',
        },
        ssn: '1113',
        dob: '01/01/1963'
      }],
      [`<div class="pageBreak" style="page-break-after:always; display: inline-block;">        <p>Sample Client <br /> 1234 Main Street<br />Santa Monica, California 12345&nbsp;</p><p><br />&nbsp;</p><p>To: Judgment Creditor, &nbsp;</p><p>From: Judgment Debtor, Sample Client &nbsp;</p><p>Case number:&nbsp; (CASE NUMBER)&nbsp;</p><p>Judgment amount:&nbsp; (AMOUNT)&nbsp;</p><p>Date: 03/23/2021&nbsp;</p><p>Dear Sir,&nbsp;&nbsp;</p>`,
        {
          from: {
            address_country: 'US',
            name: 'Sample Client',       
          },
          to: {
            address_country: 'US',
          },
          ssn: '1111',
        }  
      ]
    ];
  tests.forEach(test => {
    const output = parseLetter(test[0]);
    expect(output).toEqual(test[1])  
  });
})

it("Should return empty addresses when the destination address comes after letter dates entered in a non-supported format", function () {

  content = `<p>Sample Client</p>
  <p>1111 McKinnon-Avenue APT 3333</p>
  <p> San Francisco-California-23456</p>
  <p> Date of Birth: 01/01/1963</p>
  <p> SS#: 1113</p>
  <p> 01/01/2021</p>
  <p> Dest Name2</p>
  <p> PO Box 2000</p>
  <p> Chester, PA 12345</p>
  <p> <span> To Whom It May Concern,</span></p>`;

const output = parseLetter(content);
expect(output).toEqual({
  from: {
    address_country: 'US',
    name: 'Sample Client',       
  },
  to: {
    address_country: 'US',
  },
  ssn: '1113',
  dob: '01/01/1963'
});
});

});
