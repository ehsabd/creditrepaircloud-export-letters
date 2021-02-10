


(function () {

    /* Adapted from https://gomakethings.com/serializing-form-data-with-the-vanilla-js-formdata-object/ MIT License*/
    var serializeForm = function (form) {
        var obj = {};
        var formData = new FormData(form);
        for (var key of formData.keys()) {
            obj[key] = formData.get(key);
        }
        return obj;
    };

    /* Adapted from https://stackoverflow.com/a/40289667 CC BY-SA 4.0*/
    var blobToBase64 = function(blob, callback) {
        var reader = new FileReader();
        reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            callback(base64);
        };
        reader.readAsDataURL(blob);
    };

    const showLoader = () => {
        //TODO add a loader
    }

    const hideLoader = () => {
        //TODO add a loader (hide)
    }

    const showExportDialog = () => {

        const onProgress = (percent)=>{

            progressBar.style.background = `linear-gradient(45deg, #005 ${Math.round(percent)}%, white ${Math.round(percent)}%, white )`;
        }

        const onSubmit = ()=>{
            const form = dialog.querySelector('form');
            if (form!=null){
                exportLetters(onProgress, serializeForm(form));
            }else{
                exportLetters(onProgress);
            }   
        }

        let loading = document.createElement('div');
        loading.className ='loading';
        loading.innerText = 'Loading ...'
        let overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;background:rgba(0,0,0,.2);left:0;top:0;right:0;bottom:0;z-index:1000';
        let dialog = document.createElement('div');
        dialog.append(loading);
        dialog.style.cssText = 'position:fixed; width:400px;top:50%;left:50%;transform:translate(-50%,-50%);background:white;z-index:2000;font-size:14px;border-radius: 5px;box-shadow: #003 0px 0px 100px 0px;padding:20px;';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        let buttons = document.createElement('div');
        buttons.style.marginTop = '20px';
        let submitBtn = document.createElement('button');
        submitBtn.innerText = 'Submit';
        submitBtn.addEventListener('click', onSubmit);
        let closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.addEventListener('click', ()=>{overlay.remove()});
        buttons.append(submitBtn,closeBtn);
        let progressBar = document.createElement('div');
        progressBar.style.cssText = 'height:4px; margin-top:20px; border-radius:2px;'

        getExportEndpointUrl((exportEndpointUrl)=>{
            fetch(exportEndpointUrl).then((resp)=>resp.text()).then((data)=>{
                dialog.innerHTML += data;
            })
            .finally(()=>{
                dialog.querySelector('.loading').remove();
                dialog.appendChild(buttons);
                dialog.append(progressBar)
            });
        })
        
    }

    const exportLetters = (onProgress, extraData , round, withDoc) => {

        if (withDoc === undefined) {
            withDoc = 0;
        }

        if (round === undefined) {
            round = 1;
        }

        if ($('#hidden_value').val() != '') {
            showLoader();
            letterIds = $('#hidden_value').val().split(',');
            let letterCount = letterIds.length;
            let counter = 0;
            letterIds.forEach((id) => {
                var datastring = "lid=" + id + "&doc=" + withDoc + "&round=" + round;

                $.ajax({
                    url: '/everything/preview_letter',
                    data: datastring,
                    type: 'POST',
                    success: function (letterContent) {
                        
                        let letterData = parseLetter(letterContent);
                        letterData.crc_letter_id = id;
                        letterData.crc_username = document.getElementById('hidden_username').value;
                        if (extraData){
                            Object.assign(letterData, extraData);
                        }
                        fetchPDFBlob(letterContent).then(blob => {
                            console.log(`got the blob for lid=${id}, getting blob base64`);
                            blobToBase64(blob, (base64)=>{
                                letterData.file = base64;
                                console.log('now sending it to Google Sheet!');
                                sendDataToEndpoint(letterData, ()=>{
                                    counter++;
                                    onProgress(counter/letterCount*100);
                                });
                            });
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

    const getExportEndpointUrl = (callback) =>{
        chrome.storage.sync.get('settings',(storageData)=>{
            const {exportEndpointUrl} = storageData.settings
            callback (exportEndpointUrl);
        });
    }

    const sendDataToEndpoint = (data, successCallback, failureCallback) => {
        getExportEndpointUrl ((exportEndpointUrl) =>{
            fetch(exportEndpointUrl,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                })
                .then(resp => resp.json())
                .then(data =>{
                    successCallback(data);
                })
                
        });    
    }

        
    const sendExportMessage = () => {
        chrome.extension.sendMessage({ action: "export" }, function (response) {
            console.log(response);
        });
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
            exportBtn.addEventListener('click', showExportDialog);

            btn.parentElement.append(exportBtn);
        })
    }




})();
