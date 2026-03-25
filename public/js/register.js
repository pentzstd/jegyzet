document.getElementById("register").addEventListener("click", async (e) => {

    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

    let password_confirmation = document.getElementById("password_confirmation").value

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