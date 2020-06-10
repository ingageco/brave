FBWrapper = {
    token: {
        bearer: null,
        userID: null,
        expiresAt: 0,
        dateAccessExpiresAt: 0,
        isExpired: () => Date.now() > FBWrapper.token.expiresAt,
        isDataAccessExpired: () => Date.now() > FBWrapper.token.isDataAccessExpired
    }
}

FBWrapper.init = () => {
    FB.init({appId: '674923560015547', version: 'v7.0', cookie: true, xfbml: true})
    FB.AppEvents.logPageView()
    FB.getLoginStatus(response => FBWrapper.changeLogin(response))
    FB.Event.subscribe('auth.statusChange', response => FBWrapper.changeLogin(response));
}

FBWrapper.changeLogin = (response) => {
    if (response.status === 'connected') {
        FBWrapper.token.bearer = response.authResponse.accessToken
        FBWrapper.token.userID = response.authResponse.userID
        // expiresIn are seconds, we want expiresAt in ms
        FBWrapper.token.expiresAt = Date.now() + (response.authResponse.expiresIn * 1000)
        FBWrapper.token.dateAccessExpiresAt = response.authResponse.data_access_expiration_time

    } else {
        FBWrapper.token.bearer = null
        FBWrapper.token.userID = null
        FBWrapper.token.expiresAt = 0
        FBWrapper.token.dateAccessExpiresAt = 0

    }
}