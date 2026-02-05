const urlBase = 'http://138.68.231.161';

let userId = 0;
let firstName = "";
let lastName = "";
let temp = "";

function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;
    //	var hash = md5( password );

    document.getElementById("loginResult").innerHTML = "";

    let tmp = { login: login, password: password };
    //	var tmp = {login:login,password:hash};
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/index.php';

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }

}

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for (var i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        }
        else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        }
        else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }

    if (userId < 0) {
        window.location.href = "index.html";
    }
    else {
        const el = document.getElementById("userName");
        if (el) el.textContent = "Logged in as " + firstName + " " + lastName;
    }
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "lastName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userID= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

function addContact() {
    const f = document.getElementById("firstName").value.trim();
    const l = document.getElementById("lastName").value.trim();
    const p = document.getElementById("phone").value.trim();
    const e = document.getElementById("email").value.trim();

    document.getElementById("addResult").textContent = "";

    const tmp = { firstName: f, lastName: l, phone: p, email: e, userID: String(userId) };
    const jsonPayload = JSON.stringify(tmp);

    const url = urlBase + "/add.php";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status !== 200) {
            document.getElementById("addResult").textContent =
                "Add failed (HTTP " + xhr.status + ").";
            return;
        }

        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error && jsonObject.error.length > 0) {
            document.getElementById("addResult").textContent = jsonObject.error;
            return;
        }

        document.getElementById("addResult").textContent = "Contact added!";
        searchContacts(); // refresh list
    };

    xhr.send(jsonPayload);
}
function renderContacts(results) {
    const list = document.getElementById("contactsList");
    list.innerHTML = "";

    results.forEach((c) => {
        // normalize API fields:
        const first = c.FirstName ?? "";
        const last = c.LastName ?? "";
        const phone = c.phone ?? "";
        const email = c.Email ?? "";
        const id = c.ID ?? "";

        const row = document.createElement("div");
        row.className = "contactRow";
        row.textContent = `${first} ${last} — ${phone} — ${email} (ID: ${id})`;
        list.appendChild(row);
    });
}

function searchContacts() {
    let srch = document.getElementById("searchText").value.trim();
    document.getElementById("searchResult").textContent = "";

    let tmp = { search: srch, userId: userId }; // search.php expects userId
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + "/search.php";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status !== 200) {
            document.getElementById("searchResult").textContent =
                "Search failed (HTTP " + xhr.status + ").";
            return;
        }

        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error && jsonObject.error.length > 0) {
            document.getElementById("searchResult").textContent = jsonObject.error;
            return;
        }

        const results = jsonObject.results || [];
        document.getElementById("searchResult").textContent =
            "Found " + results.length + " contact(s).";

        renderContacts(results);
    };

    xhr.send(jsonPayload);
}


