function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.user = undefined;
        if (!req.session.user) return res.redirect("/login");
    } else {
        req.user = req.session.user;
    }
    next();
}

function checkLogged(req, res, next) {
    if (req.session.user) return res.redirect("/");
    next();
}

export { checkLogged, checkLogin };