FBWrapper = {
    lastStatus: 'unknown',
    token: {
        bearer: null,
        userID: null,
        expiresAt: 0,
        dateAccessExpiresAt: 0,
        isExpired: () => Date.now() > FBWrapper.token.expiresAt,
        isDataAccessExpired: () => Date.now() > FBWrapper.token.isDataAccessExpired
    },
    possibleTargets: []
}

FBWrapper.init = () => {
    FB.init({appId: '674923560015547', version: 'v7.0', cookie: true, xfbml: true})
    FB.AppEvents.logPageView()

    FB.getLoginStatus(response => FBWrapper.changeLogin(response))
    FB.Event.subscribe('auth.statusChange', response => FBWrapper.changeLogin(response));
    FB.Event.subscribe('auth.logout', response => FBWrapper.changeLogin(response));
}

FBWrapper.changeLogin = (response) => {
    if (FBWrapper.lastStatus !== response.status) {
        FBWrapper.lastStatus = response.status
        if (response.status === 'connected') {
            FBWrapper.token.bearer = JSON.parse(JSON.stringify(response.authResponse.accessToken))
            FBWrapper.token.userID = response.authResponse.userID
            // expiresIn are seconds, we want expiresAt in ms
            FBWrapper.token.expiresAt = Date.now() + (response.authResponse.expiresIn * 1000)
            FBWrapper.token.dateAccessExpiresAt = response.authResponse.data_access_expiration_time
            outputsHandler.possibleOutputs.facebook = 'Facebook Connect + Reactions';
            FBWrapper.fetchPossibleFacebookTargets()
        } else {
            // TODO: not called?!
            location.reload()
        }
    }
}

FBWrapper.fetchPossibleFacebookTargets = () => {
    // TODO: groups to post to
    // TODO: get events to post to
    FBWrapper.possibleTargets = []
    FB.api('/me', 'get', response => {
        FBWrapper.possibleTargets.push({
            token: FBWrapper.token.bearer,
            id: response.id,
            name: response.name,
            type: 'private'
        })
        FB.api('/me/accounts', 'get', response => {
            if (response.data && Array.isArray(response.data)) {
                const items = response.data.filter(item => item.tasks.includes("CREATE_CONTENT"))
                for (const item of items) {
                    FBWrapper.possibleTargets.push({
                        token: item.access_token,
                        id: item.id,
                        name: item.name,
                        type: 'page'
                    })
                }
            }
        });
    })
}

FBWrapper.getFacebookStream = (targetId, title, description, callback) => {
    const data = {
        title: title.substr(0, 254),
        description,
        status: 'LIVE_NOW'
    }
    FB.api(`/${targetId}/live_videos`, 'post', data, response => {
        console.log(response)
        callback(response.error, response.data ? response.data.stream_url : null)
    })
}
