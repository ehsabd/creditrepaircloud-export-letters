


(function () {

    
    const showLoader = ()=> {
        //TODO add a loader
    }

    const hideLoader = ()=> {
        //TODO add a loader (hide)
    }

    const previewLetter = (round, withDoc) => {

        if (withDoc === undefined){
            withDoc = 0;
        }

        if (round === undefined){
            round = 0;
        }

        if ($('#hidden_value').val() != '') {
            showLoader();
            var datastring = "lid=" + $('#hidden_value').val() + "&doc=" + withDoc + "&round=" + round;
            $.ajax({
                url: '/everything/preview_letter',
                data: datastring,
                type: 'POST',
                success: function (data) {
                    console.log(data);
                    hideLoader();
                }
            });
            return false;
        } else {
            alert('Please select at least one letter');
            return false;
        }

    }

    const sendExportMessage = () => {
        chrome.extension.sendMessage({ action: "export" }, function (response) {
            console.log(response);
        });
    }

    const onExport = () => {
        showLoader();
       
        previewLetter(function(data){
                console.log(data);
                hideLoader();
            
        },function(){
            console.log('letter ajax failed!');
            hideLoader();
        });

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