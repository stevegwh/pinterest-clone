exports.handle_twitter_callback = (req, res) => {
    req.session.name = req.session.grant.response.raw.screen_name;
    req.session.id = req.session.grant.response.raw.user_id;
    db.collection('users').find().toArray(function(err, result) {
        if (err) return console.log(err);

        for (var i = 0; i < result.length; i++) {
            if (result[i].name === req.session.name)
                return res.redirect("/");

        }

        let toInsert = {
            "name": req.session.name,
            "likes": [],
            "uploaded": []
        }

        db.collection('users').save(toInsert, (err,result) => {
          if (err) return console.log(err)
            res.redirect("/");
        });
    })
    
}

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

exports.login = (req, res) => {
    res.redirect('/connect/twitter/');
}