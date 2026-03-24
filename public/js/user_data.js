let user;
window.addEventListener("load", async () => {
    let res = await fetch("/me")
    let results = await res.json()
    user = {
        email: results.email
    }
    alert(user.email)
})
