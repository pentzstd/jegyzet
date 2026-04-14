let user;
window.addEventListener("load", async () => {
    let res = await fetch("/me")
    let results = await res.json()
    if (results === null) {
        window.location.href = "/login"
    }
    user = {
        email: results.email
    }
    console.log(user.email)

})

//  localStoragebol lekerdezni, h valaha csinalt e mar fikot itt valaki es
//  az alapjan kuldeni a login ra vagy registerre