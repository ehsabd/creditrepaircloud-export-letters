


(function () {

    const showLoader = () => {
        //TODO add a loader
    }

    const hideLoader = () => {
        //TODO add a loader (hide)
    }

    const previewLetter = (round, withDoc) => {

        if (withDoc === undefined) {
            withDoc = 0;
        }

        if (round === undefined) {
            round = 1;
        }

        if ($('#hidden_value').val() != '') {
            showLoader();
            $('#hidden_value').val().split(',').forEach((id) => {
                var datastring = "lid=" + id + "&doc=" + withDoc + "&round=" + round;

                $.ajax({
                    url: '/everything/preview_letter',
                    data: datastring,
                    type: 'POST',
                    success: function (letterContent) {
                        
                        let letterData = parseLetter(letterContent);
                        letterData.crc_letter_id = id;
                        fetchPDFBlob(data).then(blob => {
                            console.log(`got the blob for lid=${id}, now sending it to Google Sheet!`);
                            console.log(blob);
                        })
                        .catch(() => alert('Failed: we can\'t get the PDF blob'));
                        
                        hideLoader();
                    }
                });

            });
            return false;
        } else {
            alert('Please select at least one letter');
            return false;
        }

    }

    const fetchPDFBlob = (content) => {
        var form = new FormData();
        form.append('editorcontent', content);
        return fetch('https://app.creditrepaircloud.com/common/exportfile_batch_print',
            {
                method: "POST",
                body: form
            })
            .then(resp => resp.blob());
    };


    const sendDataToEndpoint = (data) => {
        // get endpoint from settings
        const exportEndpointUrl = 'blablabla';
        // send data to the endpoint
        return fetch(exportEndpointUrl,
            {
                method: "POST",
                body: data
            })
            .then(resp => resp.json());
    }

        
    const sendExportMessage = () => {
        chrome.extension.sendMessage({ action: "export" }, function (response) {
            console.log(response);
        });
    }

    const onExport = () => {
        showLoader();

        previewLetter();

        sendExportMessage();

        return false;
    }

    const grayBtnBigs = Array.from(document.querySelectorAll('.gray-btn-big'));
    const printBtn = grayBtnBigs.filter((item) => {
        console.log(item);
        console.log(item.innerHTML);
        const itemInnerHTML = item.innerHTML.toLowerCase();
        return itemInnerHTML.includes('print selected letters') || itemInnerHTML.includes('previewletterwithdoc')
    });
    if (printBtn.length > 0) {
        printBtn.forEach((btn) => {

            let exportBtn = document.createElement('div');
            exportBtn.style.cssText = btn.style.cssText;
            exportBtn.className = 'gray-btn-big';
            exportBtn.innerHTML = '<a href="#" class="btn-export-letters">Export Letters</a>';
            exportBtn.addEventListener('click', onExport);

            btn.parentElement.append(exportBtn);
        })
    }




})();