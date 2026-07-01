document.getElementById("login").addEventListener("click", async (e) => {
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

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