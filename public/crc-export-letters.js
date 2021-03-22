const formatLetter = require("./crc-letter-formatter");



(function () {

    const getSelectedLetters = () => {
        let selectedLetters = [];
        const tableRows = document.querySelectorAll('tr.gridrow');
        for (var i=0;i<tableRows.length;i++){
            const checkbox = tableRows[i].children[0].querySelector('input');
            const id = checkbox.value;
            const isSelected = checkbox.checked;
            if (isSelected){
                const clientName = tableRows[i].children[1].innerText.trim();
                selectedLetters.push({id:id, clientName:clientName});
            }
        }
        return selectedLetters;
    }

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

        const onComplete = () => {
            message.innerText = '<SUCCESS_MESSAGE>';
        }

        const onError = (error) => {
            let errorAlert = document.createElement('div');
            errorAlert.innerText = error;
            dialog.append(errorAlert);       
        }

        const onSubmit = ()=>{
            const include_id_bill = printOptionsForm.include_id_bill.value.split(',');
            const format = printOptionsForm.format.value;
            const round = include_id_bill[0];
            const doc = include_id_bill[1];
            const form = endpointFormWrap.querySelector('form');
            if (form!=null){
                exportLetters(onProgress, onComplete, onError, serializeForm(form), round, doc, format);
            }else{
                exportLetters(onProgress, onComplete, onError, null , round, doc, format);
            }   
            submitBtn.remove();
            endpointFormWrap.remove();
        }

        let message = document.createElement('div');
        message.innerText = 'Loading ...'
        let overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;background:rgba(0,0,0,.2);left:0;top:0;right:0;bottom:0;z-index:1000';
        let dialog = document.createElement('div');
        dialog.style.cssText = 'position:fixed; width:400px;top:50%;left:50%;transform:translate(-50%,-50%);background:white;z-index:2000;font-size:14px;border-radius: 5px;box-shadow: #003 0px 0px 100px 0px;padding:20px;';
        overlay.appendChild(dialog);
        let printOptionsForm = document.createElement('form');
        printOptionsForm.innerHTML = `
        <div>Include photo ID and proof of address (utility bill, insurance bill, etc) documents with:</div>
        <label><input checked="" type="radio" name="include_id_bill" value="1,1"> Round 1 letters only </label>
        <label><input type="radio" name="include_id_bill" value="0,1"> All letters</label>
        <label><input type="radio" name="include_id_bill" value="2,0"> Exclude</label>
        <div> Format Letter: </div>
        <label><input type="radio" name="format" value="none">No Formatting</label>
        <label><input type="radio" name="format" value="lob" checked="">LOB</label>
        `;
        let endpointFormWrap = document.createElement('div');
        dialog.append(printOptionsForm);
        dialog.append(message, endpointFormWrap);
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
                endpointFormWrap.innerHTML += data;
            })
            .finally(()=>{
                message.innerText = '';
                dialog.appendChild(buttons);
                dialog.append(progressBar)
            });
        })
        
    }

    const exportLetters = (onProgress, onComplete, onError, extraData , round, withDoc, format) => {

        if (withDoc === undefined) {
            withDoc = 0;
        }

        if (round === undefined) {
            round = 1;
        }

        selectedLetters = getSelectedLetters();

        if (selectedLetters.length>0){
            let stepsCount = (selectedLetters.length)*3;
            let stepCounter = 0;
            selectedLetters.forEach((l) => {
                const id = l.id;
                var datastring = "lid=" + id + "&doc=" + withDoc + "&round=" + round;
                $.ajax({
                    url: '/everything/preview_letter',
                    data: datastring,
                    type: 'POST',
                    success: function (letterContent) {
                        stepCounter++;
                        onProgress(stepCounter/stepsCount*100);
                        try{
                            let letterData = parseLetter(letterContent);
                            letterData.crc_letter_id = id;
                            letterData.crc_username = document.getElementById('hidden_username').value;
                            if (extraData){
                                Object.assign(letterData, extraData);
                            }
                            letterContent = formatLetter(letterContent, format);
                            fetchPDFBlob(letterContent).then(blob => {
                                stepCounter++
                                onProgress(stepCounter/stepsCount*100);
                                console.log(`got the blob for lid=${id}, getting blob base64`);
                                blobToBase64(blob, (base64)=>{
                                    console.log('now sending it to end point : '+ JSON.stringify(letterData));
                                    letterData.file = base64;
                                    sendDataToEndpoint(letterData, (data)=>{
                                        console.log(data);
                                        stepCounter++;
                                        onProgress(stepCounter/stepsCount*100);
                                        if (stepCounter == stepsCount){
                                            onComplete();
                                        }
                                    }, (error)=>{
                                        onError('Error sending to the endpoint. letterData: '+ JSON.stringify(letterData)+
                                        ', error:'+ error)
                                    });
                                });
                            })
                            .catch(() => alert('Failed: we can\'t get the PDF blob'));
                            }
                        catch(error){
                            onError('Error parsing letter. Client Name: '+ l.clientName +', Content:'+ +letterContent+'\n'+error);
                        }
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
                .then(resp => resp.text())
                .then(data =>{
                    if (~data.indexOf('"error":')){
                        failureCallback(data);
                    }
                    successCallback(data);
                })
                .catch((error) => {
                    failureCallback(error);
                });
                
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
            exportBtn.innerHTML = '<a href="#" class="btn-export-letters"><EXPORT_BUTTON_TEXT></a>';
            exportBtn.addEventListener('click', showExportDialog);

            btn.parentElement.append(exportBtn);
        })
    }




})();
