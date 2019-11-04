// Will be overridden on page load. This is just the default
var urlRoot = "https://labs.networkreliability.engineering/syringe"
var LESSONS = {};
var LESSONS_ARRAY = [];
var COLLECTIONS_ARRAY = [];

function getUrlRoot() {

    // When running antidote-web on mock data, we're running on localhost.
    // So, statically provide Syringe location/port
    if (window.location.href.includes("127.0.0.1") || window.location.href.includes("localhost")) {
        urlRoot = "http://127.0.0.1:8086"
    } else {
        // For all "real" deployments, including selfmedicate, an actual domain will be used
        // In this case, use the detected protocol+domain, and append "/syringe"
        urlRoot = window.location.href.split('/').slice(0, 3).join('/') + "/syringe";
    }
}

// This function generates a unique session ID so we can make sure you consistently connect to your lab resources on the back-end.
// We're not doing anything nefarious with this ID - this is just to make sure you have a good experience on the front-end.
function getSession() {
    var sessionCookie = document.cookie.replace(/(?:(?:^|.*;\s*)nreLabsSession\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (sessionCookie == "") {
        sessionId = makeid();
        document.cookie = "nreLabsSession=" + sessionId;
        return sessionId;
    }
    return sessionCookie;
}

function getLessonId() {
    var url = new URL(window.location.href);
    var lessonId = url.searchParams.get("lessonId");
    if (lessonId == null || lessonId == "") {
        console.log("lessonId not provided, so not attempting to load any lessons on this page.")
        console.log(url)
        return 0;
    }
    return parseInt(lessonId);
}

function getLessonStage() {
    var url = new URL(window.location.href);
    var lessonStage = url.searchParams.get("lessonStage");
    if (lessonStage == null || lessonStage == "") {
        console.log("Error: lessonStage not provided. Defaulting to 1.")
        return 1;
    }
    return parseInt(lessonStage);
}

function runSnippetInTab(tabName, snippetIndex) {

    // Select tab
    $('.nav-tabs a[href="#' + tabName + '"]').tab('show')

    if (typeof snippetIndex == 'number') {
        var snippetText = document.getElementById('labGuide').getElementsByTagName('pre')[parseInt(snippetIndex)].innerText;
    } else {
        var snippetText = snippetIndex.parentNode.previousElementSibling.innerText;
    }

    // TODO(mierdin): https://sourceforge.net/p/guacamole/discussion/1110834/thread/3243e595/
    // is this really the best way?
    // For each character in the given string
    for (var i = 0; i < snippetText.length; i++) {

        // Get current codepoint
        var codepoint = snippetText.charCodeAt(i);

        // Convert to keysym
        var keysym;
        if (codepoint >= 0x0100)
            keysym = 0x01000000 | codepoint;
        else
            keysym = codepoint;

        // Press/release key
        terminals[tabName].guac.sendKeyEvent(1, keysym);
        terminals[tabName].guac.sendKeyEvent(0, keysym);
    }
}

function gotoTab(tabName) {
    $('.nav-tabs a[href="#' + tabName + '"]').tab('show')
}

function makeid() {
    var text = "";

    // must only be lower-case alphanumeric, since this will form
    // part of the kubernetes namespace name
    var possible = "0123456789abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 16; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getRandomModalMessage() {

    // Include memes? https://imgur.com/gallery/y0LQyOV
    var messages = [
        "Sweeping technical debt under the rug...",
        "Definitely not mining cryptocurrency in your browser...",
        "Duct-taping 53 javascript frameworks together...",
        "Dividing by < ERR - DIVIDE BY ZERO. SHUTTING DOWN. AND I WAS JUST LEARNING TO LOVE.....>",
        "try { toilTime / automatingTime; } catch (DivideByZeroException e) { panic(“More NRE Labs”); }",
        "Thank you for your call. You've reached 1-800-NRE-Labs. Please hold for Dr. Automation.",
        "I'd tell you a joke about UDP, but you probably wouldn't get it.",
        "Now rendering an NRE's best friend for you to play fetch with.",
        "Our Lab-Retriever, CloudDog, is still a puppy. Thanks for your patience.",
        "Calculating airspeed velocity of an unladen swallow..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getLessonCategories() {

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", urlRoot + "/exp/lesson", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send();

    response = JSON.parse(xhttp.responseText);

    if (xhttp.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error retrieving lesson categories: " + response["error"];
        $("#busyModal").modal("hide");
        $('#errorModal').modal({ backdrop: 'static', keyboard: false })
        return
    }


    LESSONS = {}
    LESSONS_ARRAY = []
    for (var i = 0; i < response.lessons.length; i++) {

        // Store contents of response to global "LESSONS" variable as object indexed by lesson ID
        LESSONS[response.lessons[i].LessonId] = response.lessons[i]

        // Also push to lesson array
        LESSONS_ARRAY.push(response.lessons[i])
    }
}

// renderLessonCategories downloads a full list of lesson definitions, and stores them in memory
// It will also populate the Advisor page with categorized lessons
function renderLessonCategories() {

    for (var i in LESSONS) {
        if (LESSONS.hasOwnProperty(i)) {

            console.log("Adding lesson to menu - " + LESSONS[i].LessonName)
            var lessonLink = document.createElement('a');
            lessonLink.appendChild(document.createTextNode(LESSONS[i].LessonName));
            // lessonLink.classList.add('dropdown-item');
            lessonLink.href = "/labs/?lessonId=" + LESSONS[i].LessonId + "&lessonStage=1";

            var lessonListItem = document.createElement('li')
            lessonListItem.classList.add('list-group-item')
            lessonListItem.classList.add('list-categories');
            lessonListItem.appendChild(lessonLink)

            document.getElementById("lessonlist" + LESSONS[i].Category).appendChild(lessonListItem);
        }
    }
}

function renderLessonStages() {
    var reqLesson = new XMLHttpRequest();

    // TODO(mierdin): This is the first call to syringe, you should either here or elsewhere, handle errors and notify user.

    // Doing synchronous calls for now, need to convert to asynchronous
    reqLesson.open("GET", urlRoot + "/exp/lesson/" + getLessonId(), false);
    reqLesson.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    reqLesson.send();
    var lessonResponse = JSON.parse(reqLesson.responseText);

    if (reqLesson.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error retrieving lesson stages: " + lessonResponse["error"];
        $("#busyModal").modal("hide");
        $('#errorModal').modal({ backdrop: 'static', keyboard: false })
        return 0;
    }

    for (var i = 1; i < lessonResponse.Stages.length; i++) {
        var sel = document.getElementById("lessonStagesDropdown");
        var stageEntry = document.createElement('option');
        stageEntry.innerText = i + " - " + lessonResponse.Stages[i].Description
        sel.appendChild(stageEntry);
    }

    document.getElementById("lessonStagesDropdown").selectedIndex = getLessonStage() - 1;

    return lessonResponse.Stages.length - 1;
}

function stageChange() {
    var newStage = parseInt(document.getElementById("lessonStagesDropdown").selectedIndex) + 1;
    window.location.href = ".?lessonId=" + getLessonId() + "&lessonStage=" + newStage;
}

async function requestLesson() {

    var lessonStageCount = renderLessonStages()

    // Obviously a problem happened, just return
    if (lessonStageCount == 0) {
        return
    }

    var myNode = document.getElementById("tabHeaders");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    var myNode = document.getElementById("myTabContent");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    var data = {};
    data.lessonId = getLessonId();
    data.sessionId = getSession();
    data.lessonStage = getLessonStage();

    var json = JSON.stringify(data);

    // Send lesson request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", urlRoot + "/exp/livelesson", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(json);

    response = JSON.parse(xhttp.responseText);

    if (xhttp.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error with initial lesson request: " + response["error"];
        $("#busyModal").modal("hide");
        $('#errorModal').modal({ backdrop: 'static', keyboard: false })
        return
    }

    var attempts = 1;

    // get livelesson
    for (; ;) {

        // Here we go get the livelesson we requested, verify it's ready, and once it is, start wiring up endpoints.
        var xhttp2 = new XMLHttpRequest();
        xhttp2.open("GET", urlRoot + "/exp/livelesson/" + response.id, false);
        xhttp2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhttp2.send();

        var liveLessonDetails = JSON.parse(xhttp2.responseText);

        if (xhttp2.status != 200) {
            var errorMessage = document.getElementById("error-modal-body");
            errorMessage.innerText = "Error retrieving requested lesson: " + liveLessonDetails["error"];
            $("#busyModal").modal("hide");
            $('#errorModal').modal({ backdrop: 'static', keyboard: false })
            return
        }

        updateProgressModal(liveLessonDetails);

        if (liveLessonDetails.LiveLessonStatus != "READY") {

            if (attempts > 1200) {
                var errorMessage = document.getElementById("error-modal-body");
                errorMessage.innerText = "Timeout waiting for lesson to become ready.";
                $("#busyModal").modal("hide");
                $('#errorModal').modal({ backdrop: 'static', keyboard: false })
                return
            }

            attempts++;
            await sleep(500);
            continue;
        }

        renderLabGuide(liveLessonDetails.LabGuide, liveLessonDetails.JupyterLabGuide);

        if (liveLessonDetails.JupyterLabGuide) {
            document.getElementById("btnExplainJupyter").style = "display:auto;"
        } else {
            document.getElementById("btnExplainJupyter").style = "display:none;"
        }

        var diagramButton = document.getElementById("btnOpenLessonDiagram");
        var diagram = document.getElementById("lessonDiagramImg");
        if (liveLessonDetails.LessonDiagram == null) {
            diagram.src = "/images/error.png";
            diagramButton.disabled = true;
            diagramButton.innerText = "No Lesson Diagram";
        } else {
            diagram.src = liveLessonDetails.LessonDiagram;
            diagramButton.disabled = false;
            diagramButton.innerText = "Lesson Diagram";
        }

        var videoButton = document.getElementById("btnOpenLessonVideo");
        if (liveLessonDetails.LessonVideo == null) {
            videoButton.disabled = true;
            videoButton.innerText = "No Lesson Video";
        } else {
            document.getElementById("lessonVideoIframe").src = liveLessonDetails.LessonVideo;

            $('#lessonVideoModal').on('show.bs.modal', function () {
                $("#lessonVideoModal iframe").attr("src", liveLessonDetails.LessonVideo);
            });

            videoButton.disabled = false;
            videoButton.innerText = "Lesson Video";
        }

        var nextLessonStage = parseInt(getLessonStage()) + 1
        if (nextLessonStage <= lessonStageCount) {
            document.getElementById("gotoNextStage").href = "/labs/?lessonId=" + getLessonId() + "&lessonStage=" + nextLessonStage
            $("#gotoNextStage").removeClass('disabled');
            $("#gotoNextStage")[0].innerText = 'Go to the next lab in this lesson!'
        } else {
            $("#gotoNextStage").addClass('disabled');
            $("#gotoNextStage")[0].innerText = "That's it for this lesson!"
        }

        getLessonCategories()
        if (LESSONS[getLessonId()].Stages[parseInt(getLessonStage())].VerifyCompleteness == true) {
            document.getElementById("verifyBtn").style.display = "inline-block"
            document.getElementById("objectiveBtn").style.display = "inline-block"
            $("#objectiveBtn").attr('data-original-title', LESSONS[getLessonId()].Stages[parseInt(getLessonStage())].VerifyObjective)
        }

        // for some reason, even though the syringe health checks work,
        // we still can't connect right away. Adding short sleep to account for this for now
        // TODO try removing this now that the health check is SSH based
        await sleep(2000);
        addTabs(liveLessonDetails.LiveEndpoints);
        $("#busyModal").modal("hide");
        break;
    }
}

function updateProgressModal(liveLessonDetails) {

    var pBar = document.getElementById("liveLessonProgress");

    var statusMessageElement = document.getElementById("lessonStatus");
    switch (liveLessonDetails.LiveLessonStatus) {
        case "INITIAL_BOOT":
            var healthy = 0;
            var total = 0;
            if (liveLessonDetails.HealthyTests != null){
                healthy = liveLessonDetails.HealthyTests
            }
            if (liveLessonDetails.TotalTests != null){
                total = liveLessonDetails.TotalTests
            }
            statusMessageElement.innerText = "Waiting for lesson endpoints to become reachable...(" + healthy + "/" + total + ")"
            pBar.style = "width: 33%"
            break;
        case "CONFIGURATION":
            statusMessageElement.innerText = "Configuring endpoints for this lesson..."
            pBar.style = "width: 66%"
            break;
        case "READY":
            statusMessageElement.innerText = "Almost ready!"
            pBar.style = "width: 100%"
            break;
        default:
            // Shouldn't need this since we're getting rid of the default nil value on the syringe side, but just in case...
            var healthy = 0;
            var total = 0;
            if (liveLessonDetails.HealthyTests != null){
                healthy = liveLessonDetails.HealthyTests
            }
            if (liveLessonDetails.TotalTests != null){
                total = liveLessonDetails.TotalTests
            }
            statusMessageElement.innerText = "Waiting for lesson endpoints to become reachable...(" + healthy + "/" + total + ")"
            pBar.style = "width: 33%"
    }
}

function renderLabGuide(labGuideText, usesJupyter) {

    if (usesJupyter) {
        //Render iframe with jupyter notebook
        var iframe = document.createElement('iframe');
        iframe.width = "100%"
        iframe.height = "100%"
        iframe.frameBorder = "0"
        var path = "/notebooks/stage" + getLessonStage() + "/notebook.ipynb"
        iframe.src = urlRoot + "/" + getLessonId() + "-" + getSession() + "-ns-jupyterlabguide" + path

        document.getElementById("labGuideDiv").insertBefore(iframe, document.getElementById("labGuide"))
    } else {
        // Render markdown lab guide
        var converter = new showdown.Converter();
        var labHtml = converter.makeHtml(labGuideText);
        document.getElementById("labGuide").innerHTML = labHtml;
    }


}

function rescale(browserDisp, guacDisp) {
    var scale = Math.min(browserDisp.offsetWidth / Math.max(guacDisp.getWidth(), 1), browserDisp.offsetHeight / Math.max(guacDisp.getHeight(), 1));
    console.log("Scale factor is: " + scale)
    guacDisp.scale(scale);
}

function addTabs(endpoints) {

    var addedFirstTab = false;
    for (var e in endpoints) {
        var ep = endpoints[e]

        if (ep.Presentations == null){
            continue
        }

        for (var i = 0; i < ep.Presentations.length; i++) {
            var pres = ep.Presentations[i]

            var fullName = ep.Name
            if (ep.Presentations.length > 1) {
                fullName = fullName + "-" + pres.Name;
            }

            // Generic wiring for a tabbed resource of any kind
            console.log("Adding " + fullName);
            var newTabHeader = document.createElement("LI");
            newTabHeader.classList.add('nav-item');

            var a = document.createElement('a');
            var linkText = document.createTextNode(fullName);
            a.appendChild(linkText);
            a.classList.add('nav-link');
            a.href = "#" + fullName;
            a.setAttribute("data-toggle", "tab");
            if (!addedFirstTab) {
                a.classList.add('active', 'show');
            }
            newTabHeader.appendChild(a);

            document.getElementById("tabHeaders").appendChild(newTabHeader);

            var newTabContent = document.createElement("DIV");
            newTabContent.id = fullName;
            newTabContent.style = "width: 100%; height: 100%;"
            newTabContent.classList.add('tab-pane', 'fade');
            if (!addedFirstTab) {
                newTabContent.classList.add('active', 'show');
                addedFirstTab = true;
            }

            // Create presentation-specific resources
            if (pres.Type == "ssh") {

                var newGuacDiv = document.createElement("DIV");
                newGuacDiv.id = "display" + fullName
                newTabContent.appendChild(newGuacDiv)
                connectData = ep.Host + ";" + pres.Port + ";" + String(document.getElementById("myTabContent").offsetWidth) + ";" + String(document.getElementById("myTabContent").offsetHeight - 42);
                document.getElementById("myTabContent").appendChild(newTabContent);

                // MUST run this after tab content has been added to the DOM
                guacInit(fullName, connectData)

            } else if (pres.Type == "http") {

                var iframe = document.createElement('iframe');
                iframe.width = "100%"
                iframe.height = "100%"
                iframe.frameBorder = "0"

                // Using ep.Name here instead of fullName. The reason for this is, the backend ingress doesn't care how
                // many iframes are open, the path is the same regardless of how many presentations.
                // So we won't use the fullName which includes an optional differentiator - just the endpoint name.
                // ALSO - the trailing slash is tremendously important.
                iframe.src = urlRoot + "/" + getLessonId() + "-" + getSession() + "-ns-" + ep.Name + "/"

                newTabContent.appendChild(iframe);
                document.getElementById("myTabContent").appendChild(newTabContent);
            }

            console.log("Added " + fullName);
        }
    }

    // Run once, after the loop
    guacKeyboardInit()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function provisionLesson() {
    var modal = document.getElementById("modal-body");
    modal.removeChild(modal.firstChild);
    var modalMessage = document.createTextNode(getRandomModalMessage());
    modal.appendChild(modalMessage);
    $('#busyModal').modal({ backdrop: 'static', keyboard: false })

    requestLesson();
}


function paste(){
    navigator.clipboard.readText().then(
        clipText => pasteSend(clipText));
}

function pasteSend(text) {

    var tabs = document.getElementById("myTabContent").children;
    var tabId = 0;
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains("show")) {
            tabId = tabs[i].id
            break
        }
    }

    for (var i = 0; i < text.length; i++) {

        // Get current codepoint
        var codepoint = text.charCodeAt(i);

        // Convert to keysym
        var keysym;
        if (codepoint >= 0x0100)
            keysym = 0x01000000 | codepoint;
        else
            keysym = codepoint;

        // Press/release key
        terminals[tabId].guac.sendKeyEvent(1, keysym);
        terminals[tabId].guac.sendKeyEvent(0, keysym);
    }

    // Close stream
    // writer.sendEnd();
}

// We only want to copy text to the user's clipboard when they click the "Copy" button.
// So, we're storing the results of the clipboard event handler in this variable, and whenever
// the user clicks "Copy", we simply use the contents of this variable at that time.
var guacStagingClipboard = "";

// This function merely copies the contents of the above variable into the clipboard of the user.
// We're using the "execCommand" method, so we have to create a dummy input box to store the value in,
// while we call the copy command.
function copy() {
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = guacStagingClipboard;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

var terminals = {};
function guacInit(fullName, connectData) {

    var thisTerminal = {};

    var tunnel = new Guacamole.HTTPTunnel("../tunnel")

    console.log("Adding guac configuration for " + fullName)

    thisTerminal.display = document.getElementById("display" + fullName);
    thisTerminal.guac = new Guacamole.Client(
        tunnel
    );

    thisTerminal.guac.onerror = function (error) {
        console.log(error);
        console.log("Problem connecting to the remote endpoint.");
        return false
    };

    function ingestStream(stream, mimetype) {
        console.log(stream);
        stream.onblob = function (data) {
            guacStagingClipboard = atob(data)
        }
    }
    thisTerminal.guac.onclipboard = ingestStream

    thisTerminal.guac.connect(connectData);

    thisTerminal.display.appendChild(thisTerminal.guac.getDisplay().getElement());

    // Disconnect on close
    window.onunload = function () {
        thisTerminal.guac.disconnect();
    }

    // TODO(mierdin): See if you can DETECT a disconnect, and build retry logic in. If fail, provide a dialog
    // INSIDE the tab pane (per tab) that indicates a refresh is likely required
    // Would also be nice to extend retry logic to initial connection in case something is wonky to begin with

    thisTerminal.mouse = new Guacamole.Mouse(thisTerminal.guac.getDisplay().getElement());

    thisTerminal.mouse.onmousedown =
        thisTerminal.mouse.onmouseup =
        thisTerminal.mouse.onmousemove = function (id) {
            return function (mouseState) {
                terminals[id].guac.sendMouseState(mouseState);
            }
        }(fullName);

    terminals[fullName] = thisTerminal

    console.log(terminals)
    return true
}

// guacKeyboardInit() is designed to run once, after all of the other guac resources have been initialized.
// All indications are that the keyboard should be attached to "document" as below.
function guacKeyboardInit() {
    var tabs = document.getElementById("myTabContent").children;
    var keyboard = new Guacamole.Keyboard(document);
    keyboard.onkeydown = function (keysym) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if (tab.classList.contains("show")) {
                console.log(terminals[tab.id])
                terminals[tab.id].guac.sendKeyEvent(1, keysym);
            }
        }
    };
    keyboard.onkeyup = function (keysym) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if (tab.classList.contains("show")) {
                console.log(terminals[tab.id])
                terminals[tab.id].guac.sendKeyEvent(0, keysym);
            }
        }
    };

}

// Big honkin regex from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function isMobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function appendPTRBanner() {

    var buildInfoReq = new XMLHttpRequest();
    buildInfoReq.open("GET", urlRoot + "/exp/syringeinfo", false);
    buildInfoReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    buildInfoReq.send();

    if (buildInfoReq.status != 200) {
        console.log("Unable to get build info")
        return
    }
    var buildInfo = JSON.parse(buildInfoReq.responseText);

    console.log(buildInfo)

    var scripts = document.getElementsByTagName('script');
    var scriptName = "";
    for (var i in scripts) {
        thisScript = scripts[i]
        if (thisScript.src != null) {
            if (thisScript.src.includes("antidote.js")) {
                scriptName = thisScript.src
            }
        }
    }

    var commits = {
        "antidote": buildInfo.antidoteSha,
        "antidoteweb": scriptName.split("?")[1],
        "syringe": buildInfo.buildSha,
    }

    var curriculumLink = "<a target='_blank' href='https://github.com/nre-learning/nrelabs-curriculum/commit/" + commits.antidote + "'>" + commits.antidote.substring(0, 7) + "</a>"
    var antidoteWebLink = "<a target='_blank' href='https://github.com/nre-learning/antidote-web/commit/" + commits.antidoteweb + "'>" + commits.antidoteweb.substring(0, 7) + "</a>"
    var syringeLink = "<a target='_blank' href='https://github.com/nre-learning/commit/" + commits.syringe + "'>" + commits.syringe.substring(0, 7) + "</a>"

    var ptrBanner = document.createElement("DIV");
    ptrBanner.id = "ptrBanner"
    ptrBanner.style = "background-color: black;position: fixed;bottom: 0;width: 100%;height: 27px;"
    ptrBanner.innerHTML = '<span style="color: red;"><p>NRE Labs Public Test Realm. Curriculum: ' + curriculumLink + ' | Antidote-Web: ' + antidoteWebLink + ' | Syringe: ' + syringeLink + '</p></span>'

    document.body.appendChild(ptrBanner)
}



function searchBox(e) {

    searchResults = document.getElementById("searchResults")

    var options = {
        shouldSort: true,
        includeScore: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "LessonName"
        ]
    };

    // Handle keyboard events like this, so folks can arrow down to the one they want?
    // if (e.code == "ArrowDown") {}

    //TODO(mierdin): Need to figure out how to search on description and tags

    // http://fusejs.io/
    var fuse = new Fuse(LESSONS_ARRAY, options);
    var results = fuse.search(e.target.value);

    while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.firstChild);
    }

    for (var result in results) {
        var resultItem = results[result].item

        var searchResultItem = document.createElement('a');
        searchResultItem.classList.add('list-group-item');
        searchResultItem.classList.add('list-group-item-action');
        searchResultItem.style = "text-align:left;z-index: 1;"
        searchResultItem.href = "../advisor/courseplan.html?lessonId=" + resultItem.LessonId;

        var lessonTitle = document.createElement('h4');
        lessonTitle.innerText = resultItem.LessonName
        searchResultItem.appendChild(lessonTitle);

        var lessonTitle = document.createElement('p');
        lessonTitle.innerText = resultItem.Description
        searchResultItem.appendChild(lessonTitle);

        var badgesDiv = document.createElement('div');

        var categoryBadge = document.createElement('span');
        categoryBadge.classList.add('badge');
        categoryBadge.classList.add('badge-primary');
        categoryBadge.style = "margin-right: 10px;"
        categoryBadge.innerText = "Category: " + resultItem.Category
        badgesDiv.appendChild(categoryBadge);

        // FUTURE
        // var collectionBadge = document.createElement('span');
        // collectionBadge.classList.add('badge');
        // collectionBadge.classList.add('badge-info');
        // collectionBadge.style = "margin-right: 10px;"
        // collectionBadge.innerText = "Collection: " + resultItem.Collection
        // badgesDiv.appendChild(collectionBadge);

        searchResultItem.appendChild(badgesDiv);

        // Do something with this?
        // results[result].score
        searchResults.appendChild(searchResultItem)
    }
}

var PREREQS = [];

function getPrereqs(lessonId) {
    var reqLessonPrereqs = new XMLHttpRequest();

    // TODO(mierdin): This is the first call to syringe, you should either here or elsewhere, handle errors and notify user.

    // Doing synchronous calls for now, need to convert to asynchronous
    reqLessonPrereqs.open("GET", urlRoot + "/exp/lesson/" + getLessonId() + "/prereqs", false);
    reqLessonPrereqs.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    reqLessonPrereqs.send();

    var prereqs = JSON.parse(reqLessonPrereqs.responseText).prereqs;
    if (prereqs == null){
        prereqs = []
    }

    if (reqLessonPrereqs.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error retrieving lesson stages: " + prereqs["error"];
        $("#busyModal").modal("hide");
        $('#errorModal').modal({ backdrop: 'static', keyboard: false })
        return 0;
    }

    // No need to show strength sliders, this is a leson without prereqs.
    if (prereqs.length == 0) {
        buildLessonPlan({})
        $('#strengthsFinder').modal("hide")
        return 0;
    }

    $('#strengthsFinder').modal({ backdrop: 'static', keyboard: false })

    PREREQS = prereqs;

    for (var i = 0; i < prereqs.length; i++) {
        var strengthDiv = document.createElement('div');
        strengthDiv.id = "strength-" + prereqs[i]
        strengthDiv.classList.add('modal-body');

        var strengthQuestion = document.createElement('h4');
        strengthQuestion.innerText = "How well do you know " + LESSONS[prereqs[i]].Slug + "?"
        strengthDiv.appendChild(strengthQuestion);

        var strengthSlider = document.createElement('input')
        strengthSlider.id = "slider-" + prereqs[i]
        strengthSlider.type = "text"
        strengthSlider.classList.add('strength-slider');
        strengthDiv.appendChild(strengthSlider);

        var strengthLabel = document.createElement('span')
        strengthLabel.id = "slider-label-" + prereqs[i]
        // strengthLabel.innerText = "I don't know it at all."
        strengthDiv.appendChild(strengthLabel);

        document.getElementById('strengthsFinder-body').appendChild(strengthDiv)

        // https://seiyria.com/bootstrap-slider/
        var slider = new Slider("#" + "slider-" + prereqs[i], {
            step: 1,
            ticks: [1, 2, 3, 4, 5],
            min: 1,
            max: 5,
            id: "slider-" + prereqs[i],
            value: 0
        });
        slider.on("slide", function (sliderValue) {
            document.getElementById("slider-label-" + prereqs[i]).innerText = sliderValue;
        });
    }

}

function getStrengths() {
    var strengths = {}

    var sliders = document.getElementsByClassName("strength-slider");

    for (var i = 0; i < sliders.length; i++) {
        strengths[sliders[i].id.split("-")[1]] = sliders[i].value
    }

    return strengths
}

function createTimelineElement(strengthStatus, lessonId, lessonName, lessonDescription) {
    var tlContent = document.createElement('div')
    tlContent.classList.add('timeline-content');

    var descriptionText = "";

    if (strengthStatus <= 3) {
        tlContent.classList.add('timeline-content-low');
        descriptionText = '<p style="font-size: 40px;color:#fa6e6e;"><i class="fas fa-hiking" style="float: right;font-size:70px;color: #fa6e6e;"></i>Let\'s get learning.</p>'
    } else if (strengthStatus == 4) {
        tlContent.classList.add('timeline-content-mid');
        descriptionText = '<p style="font-size: 40px;color:#ffbc15;"><i class="fas fa-search" style="float: right;font-size:70px;color: #ffbc15;"></i>Let\'s do a quick review.</p>'
    } else {
        tlContent.classList.add('timeline-content-high');
        descriptionText = '<p style="font-size: 40px;color:#00d000;"><i class="fas fa-award" style="float: right;font-size:70px;color: #00d000;"></i>You\'re an expert!</p>'
    }



    var hdrDiv = document.createElement('div')
    hdrDiv.classList.add("timeline-header")

    var infoButton = document.createElement('button')
    infoButton.type = "button"
    infoButton.style = "padding: 4px;"
    infoButton.classList.add("btn")
    infoButton.classList.add("btn-info")
    infoButton.classList.add("btn-timeline-info")
    infoButton.setAttribute('data-toggle', "tooltip");
    infoButton.setAttribute('data-placement', "top");
    infoButton.setAttribute('data-original-title', lessonDescription);

    infoButton.innerHTML = '<i class="fa fa-info-circle" style="font-size:30px">'
    hdrDiv.appendChild(infoButton)

    var hdr = document.createElement('h2')
    hdr.innerHTML = '<a href="/labs/?lessonId=' + lessonId + '" target="_blank">' + lessonName + '</a>'
    hdrDiv.appendChild(hdr)

    tlContent.appendChild(hdrDiv)

    var desc = document.createElement('div')
    desc.innerHTML = descriptionText
    desc.style = "text-align: center;"
    tlContent.appendChild(desc)

    return tlContent
}

function buildLessonPlan(strengths) {

    var btnSubmit = document.getElementById("btnSubmit");
    var btnSkip = document.getElementById("btnSkip");

    btnSubmit.disabled = true
    btnSubmit.innerText = "Please wait..."
    btnSkip.disabled = true


    var timelineArray = PREREQS;
    timelineArray.push(getLessonId())

    var lastdirectionleft = true;
    for (var i = 0; i < timelineArray.length; i++) {
        var tlContainer = document.createElement('div')
        tlContainer.classList.add('timeline-container');

        // All pointing right for now. The code below alternated for us.
        // if (lastdirectionleft) {
        //     tlContainer.classList.add('timeline-right');
        //     lastdirectionleft = false
        // } else {
        //     tlContainer.classList.add('timeline-left');
        //     lastdirectionleft = true
        // }
        tlContainer.classList.add('timeline-right');

        // Default strength to 3, override if strength was actually provided in slider
        var strength = 3;
        if ((timelineArray[i] in strengths)) {
            strength = strengths[timelineArray[i]]
        }

        tlContainer.appendChild(createTimelineElement(
            strength,
            timelineArray[i],
            LESSONS[timelineArray[i]].LessonName,
            LESSONS[timelineArray[i]].Description
        ))

        document.getElementById("timeline").appendChild(tlContainer)
    }

    // Initialize all tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    $("#strengthsFinder").modal("hide");
}

async function verify() {

    var verifyBtn = document.getElementById("verifyBtn");
    verifyBtn.disabled = true
    verifyBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>'


    var verifyMsg = document.getElementById("verifyMsg");
    verifyMsg.innerText = ""

    var data = {};
    data.id = getLessonId() + "-" + getSession();

    // Send verification request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", urlRoot + "/exp/livelesson/" + getLessonId() + "-" + getSession() + "/verify", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(JSON.stringify(data));

    response = JSON.parse(xhttp.responseText);
    if (xhttp.status != 200) {
        verifyMsg.innerText = "error"
        return
    }

    for (var i = 0; i < 30; i++) {

        await sleep(1000);

        // Get verification by ID
        var xhttp2 = new XMLHttpRequest();
        xhttp2.open("GET", urlRoot + "/exp/verification/" + response.id, false);
        xhttp2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhttp2.send()

        response2 = JSON.parse(xhttp2.responseText);
        if (xhttp2.status != 200) {
            verifyMsg.innerText = "error"
            return
        }

        if (response2.working == true) {
            continue;
        }
        break;
    }

    verifyBtn.innerText = 'Verify'

    if (response2.success == true) {
        verifyMsg.innerText = "Successfully verified!"
        verifyMsg.style.color = "green"
    } else {
        verifyMsg.innerText = "Failed to verify."
        verifyMsg.style.color = "red"
    }

    // Leave message on the screen for a while
    await sleep(10000);

    // Fade out message
    var fadeEffect = setInterval(function () {
        if (!verifyMsg.style.opacity) {
            verifyMsg.style.opacity = 1;
        }
        if (verifyMsg.style.opacity > 0) {
            verifyMsg.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 200);

    // Wait for message to fade out, and then reset elements
    await sleep(4000);
    verifyMsg.innerText = ""
    verifyMsg.style.opacity = 1
    verifyBtn.disabled = false
}

function getCollectionId() {
    var url = new URL(window.location.href);
    var collectionId = url.searchParams.get("collectionId");
    if (collectionId == null || collectionId == "") {
        console.log("collectionId not provided")
        console.log(url)
        return 0;
    }
    return parseInt(collectionId);
}


function getCollections() {

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", urlRoot + "/exp/collection", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send();
    var lessonResponse = JSON.parse(xhttp.responseText);

    // if (xhttp.status != 200) {
    //     var errorMessage = document.getElementById("error-modal-body");
    //     errorMessage.innerText = "Error retrieving lesson stages: " + lessonResponse["error"];
    //     $("#busyModal").modal("hide");
    //     $('#errorModal').modal({ backdrop: 'static', keyboard: false })
    //     return 0;
    // }

    for (var i = 0; i < lessonResponse.collections.length; i++) {
        COLLECTIONS_ARRAY.push(lessonResponse.collections[i])
    }
}

function populateCollectionsList(collections) {

    // Zero out the list
    var collectionList = document.getElementById("collectionList")
    while (collectionList.firstChild) {
        collectionList.removeChild(collectionList.firstChild);
    }

    for (var i = 0; i < collections.length; i++) {

        var c = collections[i]

        if (c.Type == "vendor" && ! document.getElementById("chkVendors").checked) {
            continue
        }

        if (c.Type == "consultancy" && ! document.getElementById("chkConsultancies").checked) {
            continue
        }

        if (c.Type == "community" && ! document.getElementById("chkCommunity").checked) {
            continue
        }

        var collectionBox = document.createElement('div');
        collectionBox.classList.add("list-group-item")
        collectionBox.classList.add("list-group-item-action")
        collectionBox.classList.add("flex-column")
        collectionBox.classList.add("align-items-start")

        collectionBox.innerHTML = `
        <img class="collection-container-img" src="` + c.Image + `" />
        <div class="collection-container-div">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">` + c.Title + `</h5>
                    <span class="badge badge-info">` + c.Type + `</span>
                </div>
                <p class="mb-1">
                    ` + c.BriefDescription + `
                </p>
                <a href="/collections/view.html?collectionId=` + c.Id + `" class="btn btn-primary btn-sm" role="button" aria-disabled="true">View Collection</a>
        </div>`

        document.getElementById("collectionList").appendChild(collectionBox);
    }
}

function collectionsCheckChange() {
    collectionsBox(document.getElementById("collectionFilter").value)
}

function collectionsBox(searchQuery) {
    if (searchQuery == "") {
        populateCollectionsList(COLLECTIONS_ARRAY);
        return
    }

    var options = {
        shouldSort: true,
        includeScore: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "Title"
        ]
    };

    // Handle keyboard events like this, so folks can arrow down to the one they want?
    // if (e.code == "ArrowDown") {}

    // http://fusejs.io/
    var fuse = new Fuse(COLLECTIONS_ARRAY, options);
    var results = fuse.search(searchQuery);

    console.log(results)

    var populateResults = [];
    for (var i = 0; i < results.length; i++) {
        if (results[i].score < 0.2) {
            populateResults.push(results[i].item)
        }
    }

    populateCollectionsList(populateResults);
}

function showCollectionDetails(collectionId) {
    var xhttp2 = new XMLHttpRequest();
    xhttp2.open("GET", urlRoot + "/exp/collection/" + collectionId, false);
    xhttp2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp2.send()

    var collectionHeader = document.getElementById("collectionName")

    if (xhttp2.status != 200) {
        collectionHeader.innerText = "Error retrieving collection"
        collectionHeader.style = "margin-top: 10px;color: red;"
        return
    }
    var collectionDetails = JSON.parse(xhttp2.responseText);

    collectionHeader.innerText = collectionDetails.Title
    document.getElementById("collectionDescription").innerText = collectionDetails.LongDescription
    document.getElementById("collectionWebsite").innerHTML = '<a target="_blank" href="' + collectionDetails.Website + '">' + collectionDetails.Website + '</a>'
    document.getElementById("collectionType").innerText = collectionDetails.Type
    document.getElementById("collectionImage").src = collectionDetails.Image

    if (collectionDetails.ContactEmail == null || collectionDetails.ContactEmail == "") {
        document.getElementById("collectionEmail").innerText = "Not provided"
    } else {
        document.getElementById("collectionEmail").innerHTML = '<a href="mailto:' + collectionDetails.ContactEmail + '">' + collectionDetails.ContactEmail + '</a>'
    }

    if (collectionDetails.Lessons == null) {
        var lessonRow = document.createElement('tr');
        lessonRow.classList.add("table-default")

        lessonRow.innerHTML = `
          <th scope="row"></th>
          <td><p>Coming soon!</p></td>
          <td></td>`

        document.getElementById("lessonRows").appendChild(lessonRow);
        return
    }

    // Render lessons table
    for (var i = 0; i < collectionDetails.Lessons.length; i++) {
        lesson = collectionDetails.Lessons[i]
        var lessonRow = document.createElement('tr');
        lessonRow.classList.add("table-default")

        // Lesson launch button in its own column. Will be invisible on mobile
        var launchButtonColumn = `<a href="/labs/index.html?lessonId=` + lesson.lessonId + `" class="btn btn-primary btn-sm launchColumn" role="button" aria-disabled="true">Launch Lesson</a>`
        
        // Inline button for mobile. Will be invisible when on desktop
        var launchButtonInline = `<a href="/labs/index.html?lessonId=` + lesson.lessonId + `" class="btn btn-primary btn-sm launchInline" role="button" aria-disabled="true">Launch Lesson</a>`

        lessonRow.innerHTML = `
          <th scope="row">` + lesson.lessonName + `</th>
          <td><p>` + lesson.lessonDescription + `</p>` + launchButtonInline + `</td>
          <td>` + launchButtonColumn + `</td>`

        document.getElementById("lessonRows").appendChild(lessonRow);
    }
}
