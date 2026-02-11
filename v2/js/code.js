const urlBase = 'http://138.68.231.161/LAMPAPI';
let userId = 0;
let firstName = "";
let lastName = "";
let currentEditId = -1;

function resetUI(ids, msgId) {
    ids.forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.remove("bad-in");
        let ico = document.getElementById(id + "Ico");
        if(ico) ico.style.display = "none";
    });
    let m = document.getElementById(msgId);
    if (m) { m.style.display = "none"; m.innerHTML = ""; }
}

function doLogin() {
    let u = document.getElementById("loginName");
    let p = document.getElementById("loginPassword");
    let m = document.getElementById("loginError");
    resetUI(["loginName", "loginPassword"], "loginError");

    let miss = [];
    if (!u.value.trim()) miss.push(u);
    if (!p.value.trim()) miss.push(p);

    if (miss.length > 0) {
        miss.forEach(el => {
            el.classList.add("bad-in");
            document.getElementById(el.id + "Ico").style.display = "block";
        });
        m.innerHTML = "Please enter your username and password.";
        m.style.display = "block"; m.className = "msg error"; return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + '/login.php', true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            if (res.id < 1) { m.innerHTML = "Invalid credentials."; m.style.display = "block"; m.className = "msg error"; return; }
            userId = res.id; firstName = res.firstName; lastName = res.lastName;
            saveCookie();
            window.location.href = "contacts.html";
        }
    };
    xhr.send(JSON.stringify({ login: u.value, password: p.value }));
}

function doRegister() {
    let f = document.getElementById("regFirstName");
    let l = document.getElementById("regLastName");
    let u = document.getElementById("regLogin");
    let p = document.getElementById("regPassword");
    let m = document.getElementById("regResult");
    resetUI(["regFirstName", "regLastName", "regLogin", "regPassword"], "regResult");

    let fields = [{el:f}, {el:l}, {el:u}, {el:p}];
    let empty = fields.filter(x => !x.el.value.trim());
    let passShort = p.value.trim().length < 6;

    if (empty.length > 0) {
        empty.forEach(x => {
            x.el.classList.add("bad-in");
            document.getElementById(x.el.id + "Ico").style.display = "block";
        });

        if (passShort && p.value.trim() !== "") {
             p.classList.add("bad-in");
             document.getElementById("regPasswordIco").style.display = "block";
        }

        m.style.display = "block"; m.className = "msg error";
        m.innerHTML = "All fields are required!";
        return;
    }

    if (passShort) {
        p.classList.add("bad-in");
        document.getElementById("regPasswordIco").style.display = "block";
        m.style.display = "block"; m.className = "msg error";
        m.innerHTML = "Password must be at least 6 characters.";
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + '/register.php', true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            m.style.display = "block";
            if (res.error) { m.className = "msg error"; m.innerHTML = res.error; }
            else {
                m.className = "msg success"; m.innerHTML = "Registration successful! Redirecting...";
                setTimeout(() => { window.location.href = "index.html"; }, 2000);
            }
        }
    };
    xhr.send(JSON.stringify({ firstName: f.value, lastName: l.value, login: u.value, password: p.value }));
}

function renderContacts(items) {
    let list = document.getElementById("contactsList");
    list.innerHTML = "";
    items.forEach(c => {
        let r = document.createElement("div");
        r.className = "row";
        let f = c.FirstName; let l = c.LastName; let p = c.Phone; let e = c.Email; let id = c.ID;
        
        r.innerHTML = `
            <div>
                <strong>${f} ${l}</strong><br>
                <span style="font-size:0.9rem; color:#555">${p} | ${e}</span>
            </div>
            <div>
                <button class="btn" style="min-width:60px; height:30px; font-size:0.8rem; margin-right:10px" 
                onclick="openEditModal(${id}, '${f}', '${l}', '${p}', '${e}')">Edit</button>
                
                <button class="btn btn-del" style="min-width:60px; height:30px; font-size:0.8rem" 
                onclick="deleteContact(${id})">Delete</button>
            </div>`;
        list.appendChild(r);
    });
}

function searchContacts() {
    let s = document.getElementById("searchText");
    let m = document.getElementById("searchResult");
    resetUI(["searchText"], "searchResult");

    if (!s.value.trim()) {
        s.classList.add("bad-in");
        document.getElementById("searchTextIco").style.display = "block";
        m.innerHTML = "Please type at least one character!";
        m.style.display = "block"; m.className = "msg error"; return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/search.php", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            let items = res.results || [];
            if (items.length === 0) { 
                let list = document.getElementById("contactsList");
                list.innerHTML = '<div class="row" style="color:#e81123; text-align:center;">No contacts found.</div>'; 
            } else {
                renderContacts(items);
            }
        }
    };
    xhr.send(JSON.stringify({ search: s.value, userId: userId }));
}

function addContact() {
    let f = document.getElementById("firstName");
    let l = document.getElementById("lastName");
    let p = document.getElementById("phone");
    let e = document.getElementById("email");
    let m = document.getElementById("addResult");
    resetUI(["firstName", "lastName", "phone", "email"], "addResult");

    let fields = [{el:f}, {el:l}, {el:p}, {el:e}];
    let empty = fields.filter(x => !x.el.value.trim());

    if (empty.length > 0) {
        empty.forEach(x => {
            x.el.classList.add("bad-in");
            document.getElementById(x.el.id + "Ico").style.display = "block";
        });
        m.style.display = "block"; m.className = "msg error";
        m.innerHTML = "All fields are required!";
        return;
    }

    let phoneErr = false;
    let emailErr = false;

    if (!/^\+?[0-9]+$/.test(p.value.trim()) || p.value.trim().replace(/[^0-9]/g, "").length < 3) {
        phoneErr = true;
        p.classList.add("bad-in");
        document.getElementById("phoneIco").style.display = "block";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim())) {
        emailErr = true;
        e.classList.add("bad-in");
        document.getElementById("emailIco").style.display = "block";
    }

    if (phoneErr || emailErr) {
        m.style.display = "block"; m.className = "msg error";
        if (phoneErr && emailErr) m.innerHTML = "Phone and Email format incorrect.";
        else if (phoneErr) m.innerHTML = "Phone format incorrect.";
        else m.innerHTML = "Email format incorrect.";
        return;
    }

    let newName = f.value;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/add.php", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            m.className = "msg success"; m.innerHTML = "Contact Saved Successfully!";
            m.style.display = "block";
            f.value = ""; l.value = ""; p.value = ""; e.value = "";
            document.getElementById("searchText").value = newName;
            searchContacts();
            setTimeout(() => { m.style.display = "none"; }, 3000);
        }
    };
    xhr.send(JSON.stringify({ firstName: f.value, lastName: l.value, phone: p.value, email: e.value, userID: String(userId) }));
}

function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/delete.php", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            searchContacts(); 
        }
    };
    xhr.send(JSON.stringify({ id: id }));
}

function injectEditIcons() {
    const ids = ["editFirst", "editLast", "editPhone", "editEmail"];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el && !el.parentNode.className.includes("f-row")) {
            let wrapper = document.createElement("div");
            wrapper.className = "f-row";
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
            let ico = document.createElement("div");
            ico.id = id + "Ico";
            ico.className = "err-ico";
            wrapper.appendChild(ico);
        }
    });
}

function openEditModal(id, f, l, p, e) {
    currentEditId = id;
    injectEditIcons();
    
    document.getElementById("editFirst").value = f;
    document.getElementById("editLast").value = l;
    document.getElementById("editPhone").value = p;
    document.getElementById("editEmail").value = e;
    
    resetUI(["editFirst", "editLast", "editPhone", "editEmail"], "editMsg");
    
    if (!document.getElementById("editMsg")) {
        let m = document.createElement("div");
        m.id = "editMsg"; m.className = "msg error"; m.style.display = "none";
        let c = document.querySelector(".modal-content");
        c.insertBefore(m, c.children[1]); 
    }
    
    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

function submitEdit() {
    let f = document.getElementById("editFirst");
    let l = document.getElementById("editLast");
    let p = document.getElementById("editPhone");
    let e = document.getElementById("editEmail");
    let m = document.getElementById("editMsg");
    
    resetUI(["editFirst", "editLast", "editPhone", "editEmail"], "editMsg");

    let fields = [{el:f}, {el:l}, {el:p}, {el:e}];
    let empty = fields.filter(x => !x.el.value.trim());

    if (empty.length > 0) {
        empty.forEach(x => {
            x.el.classList.add("bad-in");
            document.getElementById(x.el.id + "Ico").style.display = "block";
        });
        m.innerHTML = "All fields are required.";
        m.style.display = "block";
        return;
    }

    let phoneErr = false;
    let emailErr = false;

    if (!/^\+?[0-9]+$/.test(p.value.trim()) || p.value.trim().replace(/[^0-9]/g, "").length < 3) {
        phoneErr = true;
        p.classList.add("bad-in");
        document.getElementById("editPhoneIco").style.display = "block";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim())) {
        emailErr = true;
        e.classList.add("bad-in");
        document.getElementById("editEmailIco").style.display = "block";
    }

    if (phoneErr || emailErr) {
        m.style.display = "block";
        if (phoneErr && emailErr) m.innerHTML = "Phone and Email format incorrect.";
        else if (phoneErr) m.innerHTML = "Phone format incorrect.";
        else m.innerHTML = "Email format incorrect.";
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/edit.php", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            closeEditModal();
            searchContacts(); 
        }
    };
    xhr.send(JSON.stringify({ id: currentEditId, firstName: f.value, lastName: l.value, phone: p.value, email: e.value }));
}

function saveCookie() {
    let d = new Date();
    d.setTime(d.getTime() + (20 * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + d.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie.split(",");
    for (let i = 0; i < data.length; i++) {
        let pair = data[i].trim().split("=");
        if (pair[0] == "firstName") firstName = pair[1];
        if (pair[0] == "userId") userId = parseInt(pair[1]);
    }
    if (userId < 0) window.location.href = "index.html";
    else {
        let el = document.getElementById("userName");
        if(el) el.textContent = "Welcome, " + firstName;
    }
}

function doLogout() {
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

