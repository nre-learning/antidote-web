// Will be overridden on page load. This is just the default
var urlRoot = "https://labs.networkreliability.engineering"

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

// TODO(mierdin): build an extension to showdown so you don't have to provide the snippet index in the lesson guide
function runSnippetInTab(tabName, snippetIndex) {

    // Select tab
    $('.nav-tabs a[href="#' + tabName + '"]').tab('show')

    // TODO(mierdin): https://sourceforge.net/p/guacamole/discussion/1110834/thread/3243e595/
    // is this really the best way?
    // For each character in the given string
    var snippetText = document.getElementById('labGuide').getElementsByTagName('pre')[parseInt(snippetIndex)].innerText;
    for (var i=0; i < snippetText.length; i++) {

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

function renderLessonCategories() {

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", urlRoot + "/syringe/exp/lessondef/all", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send();

    if (xhttp.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error retrieving lesson categories: " + response["error"];
        $("#busyModal").modal("hide");
        $("#errorModal").modal("show");
        return
    }

    categories = JSON.parse(xhttp.responseText).lessonCategories;
    console.log("Received lesson defs fom syringe: ")
    console.log(categories)

    for (var category in categories) {
        var lessonDefs = categories[category].lessonDefs;

        for (var i = 0; i < lessonDefs.length; i++) {
            console.log("Adding lesson to menu - " + lessonDefs[i].LessonName)
            var lessonLink = document.createElement('a');
            lessonLink.appendChild(document.createTextNode(lessonDefs[i].LessonName));
            lessonLink.classList.add('dropdown-item');
            lessonLink.href = "/labs/?lessonId=" + lessonDefs[i].LessonId + "&lessonStage=1";
            document.getElementById(category+"Menu").appendChild(lessonLink);
        }

        // Populate quick start button with a random lesson
        var quickStartButton = document.getElementById("btn"+category);
        if (quickStartButton) {
            var rand = Math.floor(Math.random() * categories[category].lessonDefs.length)
            var randLessonId = categories[category].lessonDefs[rand].LessonId
            quickStartButton.href = "/labs/?lessonId=" + randLessonId + "&lessonStage=1"
        }
    }
}

function renderLessonStages() {
    var reqLessonDef = new XMLHttpRequest();

    // TODO(mierdin): This is the first call to syringe, you should either here or elsewhere, handle errors and notify user.

    // Doing synchronous calls for now, need to convert to asynchronous
    reqLessonDef.open("GET", urlRoot + "/syringe/exp/lessondef/" + getLessonId(), false);
    reqLessonDef.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    reqLessonDef.send();
    var lessonDefResponse = JSON.parse(reqLessonDef.responseText);

    if (reqLessonDef.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error retrieving lesson stages: " + lessonDefResponse["error"];
        $("#busyModal").modal("hide");
        $("#errorModal").modal("show");
        return 0;
    }

    for (var i = 0; i < lessonDefResponse.Stages.length; i++) {
        stageId = i+1
        var sel = document.getElementById("lessonStagesDropdown");
        var stageEntry = document.createElement('option');
        stageEntry.innerText = stageId + " - " + lessonDefResponse.Stages[i].Description
        sel.appendChild(stageEntry);
    }

    document.getElementById("lessonStagesDropdown").selectedIndex = getLessonStage() - 1;

    return lessonDefResponse.Stages.length;
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
    // TODO(mierdin): for all these loops, need to break if we either get a non 200 status for too long,
    // or if the lesson fails to provision (ready: true) before a timeout. Can't just loop endlessly.
    // for (; ;) {
    //     var xhttp = new XMLHttpRequest();

    //     // Doing synchronous calls for now, need to convert to asynchronous
    //     xhttp.open("POST", urlRoot + "/syringe/exp/livelesson", false);
    //     xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    //     xhttp.send(json);

    //     if (xhttp.status != 200) {
    //         await sleep(1000);
    //         continue;
    //     }
    //     break;
    // }

    // Send lesson request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", urlRoot + "/syringe/exp/livelesson", false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(json);

    response = JSON.parse(xhttp.responseText);

    if (xhttp.status != 200) {
        var errorMessage = document.getElementById("error-modal-body");
        errorMessage.innerText = "Error with initial lesson request: " + response["error"];
        $("#busyModal").modal("hide");
        $("#errorModal").modal("show");
        return
    }

    var attempts = 1;

    // get livelesson
    for (; ;) {

        // Here we go get the livelesson we requested, verify it's ready, and once it is, start wiring up endpoints.
        var xhttp2 = new XMLHttpRequest();
        xhttp2.open("GET", urlRoot + "/syringe/exp/livelesson/" + response.id, false);
        xhttp2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhttp2.send();

        if (xhttp2.status != 200) {
            var errorMessage = document.getElementById("error-modal-body");
            errorMessage.innerText = "Error retrieving requested lesson: " + response["error"];
            $("#busyModal").modal("hide");
            $("#errorModal").modal("show");
            return
        }

        var response2 = JSON.parse(xhttp2.responseText);

        if (!response2.Ready) {

            if (attempts > 1200) {
                var errorMessage = document.getElementById("error-modal-body");
                errorMessage.innerText = "Timeout waiting for lesson to become ready.";
                $("#busyModal").modal("hide");
                $("#errorModal").modal("show");
                return
            }

            attempts++;
            await sleep(500);
            continue;
        }

        var endpoints = response2.Endpoints;

        var sort = function (prop, arr) {
            return arr.sort(function (a, b) {
                if (a[prop] < b[prop]) {
                    return -1;
                } else if (a[prop] > b[prop]) {
                    return 1;
                } else {
                    return 0;
                }
            });
        };

        endpoints = sort("Name", endpoints);
        renderLabGuide(response2.LabGuide);

        var diagramButton = document.getElementById("btnOpenLessonDiagram");
        var diagram = document.getElementById("lessonDiagramImg");
        if (response2.LessonDiagram == null) {
            diagram.src = "/images/error.png";
            diagramButton.disabled = true;
            diagramButton.innerText = "No Lesson Diagram";
        } else {
            diagram.src = response2.LessonDiagram;
            diagramButton.disabled = false;
            diagramButton.innerText = "Open Lesson Diagram";
        }

        var nextLessonStage = parseInt(getLessonStage()) + 1
        if (nextLessonStage <= lessonStageCount) {
            document.getElementById("gotoNextStage").href = "/labs/?lessonId=" + getLessonId() + "&lessonStage=" + nextLessonStage
            $("#gotoNextStage").removeClass('disabled');
        } else {
            $("#gotoNextStage").addClass('disabled');
        }

        // for some reason, even though the syringe health checks work,
        // we still can't connect right away. Adding short sleep to account for this for now
        // TODO try removing this now that the health check is SSH based
        await sleep(2000);
        addTabs(endpoints);
        $("#busyModal").modal("hide");
        break;
    }
}

function renderLabGuide(url) {
    var lgGetter = new XMLHttpRequest();
    lgGetter.open('GET', url, false);
    lgGetter.send();

    var converter = new showdown.Converter();
    var labHtml = converter.makeHtml(lgGetter.responseText);
    document.getElementById("labGuide").innerHTML = labHtml;
}

function rescale(browserDisp, guacDisp) {
    var scale = Math.min(browserDisp.offsetWidth / Math.max(guacDisp.getWidth(), 1), browserDisp.offsetHeight / Math.max(guacDisp.getHeight(), 1));
    console.log("Scale factor is: " + scale)
    guacDisp.scale(scale);
}

function addTabs(endpoints) {

    // Add Devices tabs
    for (var i = 0; i < endpoints.length; i++) {
        if (endpoints[i].Type == "DEVICE" || endpoints[i].Type == "UTILITY") {
            console.log("Adding " + endpoints[i].Name);
            var newTabHeader = document.createElement("LI");
            newTabHeader.classList.add('nav-item');

            var a = document.createElement('a');
            var linkText = document.createTextNode(endpoints[i].Name);
            a.appendChild(linkText);
            a.classList.add('nav-link');
            a.href = "#" + endpoints[i].Name;
            a.setAttribute("data-toggle", "tab");
            if (i == 0) {
                a.classList.add('active', 'show');
            }
            newTabHeader.appendChild(a);

            document.getElementById("tabHeaders").appendChild(newTabHeader);

            var newTabContent = document.createElement("DIV");
            newTabContent.id = endpoints[i].Name;
            newTabContent.classList.add('tab-pane', 'fade');
            if (i == 0) {
                newTabContent.classList.add('active', 'show');
            }
            // newTabContent.height="350px";
            // newTabContent.style.height = "350px";
            newTabContent.style="height: 100%;";

            var newGuacDiv = document.createElement("DIV");
            newGuacDiv.id = "display" + endpoints[i].Name
            // newGuacDiv.height="300px";
            // newGuacDiv.style.height = "300px";


            newTabContent.appendChild(newGuacDiv)

            document.getElementById("myTabContent").appendChild(newTabContent);

            console.log("Added " + endpoints[i].Name);
        }
    }

    for (var i = 0; i < endpoints.length; i++) {
        if (endpoints[i].Type == "IFRAME") {
            console.log("Adding " + endpoints[i].Name);
            var newTabHeader = document.createElement("LI");
            newTabHeader.classList.add('nav-item');

            var a = document.createElement('a');
            var linkText = document.createTextNode(endpoints[i].Name);
            a.appendChild(linkText);
            a.classList.add('nav-link');
            a.href = "#" + endpoints[i].Name;
            a.setAttribute("data-toggle", "tab");
            if (i == 0) {
                a.classList.add('active', 'show');
            }
            newTabHeader.appendChild(a);

            document.getElementById("tabHeaders").appendChild(newTabHeader);

            var newTabContent = document.createElement("DIV");
            newTabContent.id = endpoints[i].Name;
            newTabContent.style = "width: 100%; height: 100%;"
            newTabContent.classList.add('tab-pane', 'fade');
            if (i == 0) {
                newTabContent.classList.add('active', 'show');
            }

            var iframe = document.createElement('iframe');
            iframe.width = "100%"
            iframe.height = "100%"
            iframe.frameBorder = "0"
            iframe.src = String(endpoints[i].IframeDetails.Protocol) + "://vip.labs.networkreliability.engineering:" + String(endpoints[i].IframeDetails.Port) + String(endpoints[i].IframeDetails.URI)
            newTabContent.appendChild(iframe);
            document.getElementById("myTabContent").appendChild(newTabContent);

            console.log("Added " + endpoints[i].Name);
        }
    }
    guacInit(endpoints);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function provisionLesson() {
    var modal = document.getElementById("modal-body");
    modal.removeChild(modal.firstChild);
    var modalMessage = document.createTextNode(getRandomModalMessage());
    modal.appendChild(modalMessage);
    $('#busyModal').modal({backdrop: 'static', keyboard: false})  

    requestLesson();
}

var terminals = {};
function guacInit(endpoints) {

    for (var i = 0; i < endpoints.length; i++) {
        if (endpoints[i].Type == "DEVICE" || endpoints[i].Type == "UTILITY") {

            var thisTerminal = {};

            var tunnel = new Guacamole.HTTPTunnel("../tunnel")

            console.log("Adding guac configuration for " + endpoints[i].Name)

            thisTerminal.display = document.getElementById("display" + endpoints[i].Name);
            thisTerminal.guac = new Guacamole.Client(
                tunnel
            );

            thisTerminal.guac.onerror = function (error) {
                console.log(error);
                console.log("Problem connecting to the remote endpoint.");
                return false
            };

            //TODO get from API
            var username = ""
            var password = ""
            if (endpoints[i].Type == "DEVICE") {
                username = "root"
                password = "VR-netlab9"
            } else if (endpoints[i].Type == "UTILITY") {
                username = "antidote"
                password = "antidotepassword"
            }

            connectData = endpoints[i].Host + ";" + endpoints[i].Port + ";" + String(document.getElementById("myTabContent").offsetWidth) + ";" + String(document.getElementById("myTabContent").offsetHeight - 42) + ";" + username + ";" + password;
            thisTerminal.guac.connect(connectData);

            thisTerminal.display.appendChild(thisTerminal.guac.getDisplay().getElement());

            // Disconnect on close
            window.onunload = function () {
                thisTerminal.guac.disconnect();
            }

            terminals[endpoints[i].Name] = thisTerminal
        }
    }

    var tabs = document.getElementById("myTabContent").children;
    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];

        // TODO(mierdin): Obviously this only works if the tab is named "jupyter". Should come up with better long-term solution soon.
        if (tab.id == "jupyter") {
            continue
        }
        terminals[tab.id].mouse = new Guacamole.Mouse(terminals[tab.id].guac.getDisplay().getElement());

        terminals[tab.id].mouse.onmousedown =
            terminals[tab.id].mouse.onmouseup =
            terminals[tab.id].mouse.onmousemove = function (mouseState) {
                terminals[tab.id].guac.sendMouseState(mouseState);
            };
    }

    var keyboard = new Guacamole.Keyboard(document);
    keyboard.onkeydown = function (keysym) {
        var tabs = document.getElementById("myTabContent").children;
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if (tab.classList.contains("show")) {
                console.log(terminals[tab.id])
                terminals[tab.id].guac.sendKeyEvent(1, keysym);
            }
        }
    };
    keyboard.onkeyup = function (keysym) {
        var tabs = document.getElementById("myTabContent").children;
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            if (tab.classList.contains("show")) {
                console.log(terminals[tab.id])
                terminals[tab.id].guac.sendKeyEvent(0, keysym);
            }
        }
    };

    console.log(terminals)
    return true
}

// Run all this once the DOM is fully rendered so we can get a handle on the DIVs
document.addEventListener('DOMContentLoaded', function () {

    urlRoot = window.location.href.split('/').slice(0, 3).join('/');

    renderLessonCategories()

    if (getLessonId() != 0) {
        provisionLesson();
    }

    $('#videoModal').on('show.bs.modal', function () {
      $("#videoModal iframe").attr("src", "https://www.youtube.com/embed/YhbWBX71yGQ?autoplay=1&rel=0");
    });
    
    $("#videoModal").on('hidden.bs.modal', function (e) {
      $("#videoModal iframe").attr("src", null);
    });

    if (urlRoot.substring(0,11) == "https://ptr") {
        appendPTRBanner();
    }
});

function appendPTRBanner() {

    var buildInfoReq = new XMLHttpRequest();
    buildInfoReq.open("GET", urlRoot + "/syringe/exp/syringeinfo", false);
    buildInfoReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    buildInfoReq.send();

    if (buildInfoReq.status != 200) {
        console.log("Unable to get build info")
        return
    }
    var buildInfo = JSON.parse(buildInfoReq.responseText);

    console.log(buildInfo)

    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length-1];
    var scriptName = lastScript.src;

    var commits = {
        "antidote": buildInfo.antidoteSha,
        "antidoteweb": scriptName.split("?")[1],
        "syringe": buildInfo.buildSha,
    }

    var antidoteLink = "<a target='_blank' href='https://github.com/nre-learning/antidote/commit/" + commits.antidote + "'>" + commits.antidote.substring(0,7) + "</a>"
    var antidoteWebLink = "<a target='_blank' href='https://github.com/nre-learning/antidote-web/commit/" + commits.antidoteweb + "'>" + commits.antidoteweb.substring(0,7) + "</a>"
    var syringeLink = "<a target='_blank' href='https://github.com/nre-learning/syringe/commit/" + commits.syringe + "'>" + commits.syringe.substring(0,7) + "</a>"

    var ptrBanner = document.createElement("DIV");
    ptrBanner.id = "ptrBanner"
    ptrBanner.style = "background-color: black;"
    ptrBanner.innerHTML = '<span style="color: red;"><p>NRE Labs Public Test Realm. Antidote: ' + antidoteLink + ' | Antidote-Web: ' + antidoteWebLink + ' | Syringe: ' + syringeLink + '</p></span>'

    document.body.appendChild(ptrBanner)
}

