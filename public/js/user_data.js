let user;
window.addEventListener("load", async () => {
    let res = await fetch("/me")
    let results = await res.json()
    if (results === null) {
        window.location.href = "/register"
    }
    user = {
        email: results.email
    }
    console.log(user.email)

})
