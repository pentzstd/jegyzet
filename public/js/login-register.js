document.getElementById("register_button").addEventListener("click", async (e) => {

    let email = document.getElementById("register_email").value
    let password = document.getElementById("register_password").value

    let password_confirmation = document.getElementById("register_password_confirmation").value

    if (password == password_confirmation) {
        const data = {
            email : email,
            password : password
        }

        const res = await fetch("/register", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data)
        })

        const result = await res.json();

        if (result.success) { window.location.href = "/" }
        else { alert("Hiba a regisztrálás közben!") }
    }
    else {
        alert("A jelszók nem egyeznek!")
    }
    
})

document.getElementById("login_button").addEventListener("click", async (e) => {
    let email = document.getElementById("login_email").value
    let password = document.getElementById("login_password").value

    const data = {
        email: email,
        password: password
    }

    const res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })

    const result = await res.json();
    if (result.success) {
        alert("Sikeres bejelentkezés!")
        window.location.href = "/"
    }
    else {
        alert("Sikertelen bejelentkezés!")
    }
})

document.getElementById("log_off").addEventListener("click", async () => {
    const res = await fetch("/log-out")
    const result = res.status
    window.location.href = "/login"
})