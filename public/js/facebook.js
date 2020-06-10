FBWrapper = {}

FBWrapper.init = () => {
    FB.init({appId: '674923560015547', version: 'v7.0', cookie: true, xfbml: true})
    FB.AppEvents.logPageView()

    FB.getLoginStatus(response => FBWrapper.changeLogin(response))
    FB.Event.subscribe('auth.statusChange', response => FBWrapper.changeLogin(response));
}

FBWrapper.changeLogin = (response) => {
    console.log(response) // .status === connected oder !== connected
}