'use strict';

var learnjs = {
    poolId: 'ap-northeast-1:71419b00-7693-405a-a346-71ae99d6f403'
};
learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() { return __; }"
    },
    {
        description: "Simple Match",
        code: "function problem() { return 42 === 6 * __; }"
    }
];
learnjs.identity = new $.Deferred();

learnjs.flashElement = function(elem, content) {
    elem.fadeOut('fast', function() {
        elem.html(content);
        elem.fadeIn();
    })
}


learnjs.template = function(name) {
    return $('.templates .' + name).clone();
}


learnjs.buildCorrectFlash = function (problemNum) {
    var correctFlash = learnjs.template('correct-flash');
    var link = correctFlash.find('a');
    if (problemNum < learnjs.problems.length) {
        link.attr('href', '#problem-' + (problemNum + 1));
    } else {
        link.attr('href', '');
        link.text("You're Finished!");
    }
    return correctFlash;
}


learnjs.landingView = function() {
    return learnjs.template('landing-view');
};


learnjs.triggerEvent = function(name, args) {
    $('.view-container>*').trigger(name,args);
}

learnjs.problemView = function(data) {
    var problemNumber = parseInt(data, 10);
    console.log(problemNumber);
    var view = learnjs.template('problem-view');
    var problemData = learnjs.problems[problemNumber - 1];
    var resultFlash = view.find('.result');

    function checkAnswer() {
        var answer = view.find('.answer').val();
        var test = problemData.code.replace('__', answer) + '; problem();';
        return eval(test);
    }

    function checkAnswerClick() {
        if (checkAnswer()) {
            learnjs.flashElement(resultFlash, learnjs.buildCorrectFlash(problemNumber));
        } else {
            learnjs.flashElement(resultFlash, 'Incorrect!');
        }
        return false;
    }

    view.find('.check-btn').on('click', checkAnswerClick);
    view.find('.title').text('Problem #' + problemNumber);
    if(problemNumber < learnjs.problems.length) {
        var buttonItem = learnjs.template('skip-btn');
        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
        $('.nav-list').append(buttonItem);
        view.bind('removingView', function() {
            buttonItem.remove();
        });
    }
    learnjs.applyObject(problemData,view);
    return view;
};


learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#profile': learnjs.profileView,
        '#': learnjs.landingView,
        '': learnjs.landingView
    };
    var hashParts = hash.split('-');
    var viewFn = routes[hashParts[0]];
    if (viewFn) {
        learnjs.triggerEvent('removingView',[]);
        $('.view-container').empty().append(viewFn(hashParts[1]));
    }
};


learnjs.applyObject = function(obj, elem) {
    for (var key in obj) {
        elem.find('[data-name="' + key + '"]').text(obj[key]);
    }
}


learnjs.addProfileLink = function(profile) {
    var link = learnjs.template('profile-link');
    link.find('a').text(profile.email);
    console.log(link.find('a').text());
    $('.signin-bar').prepend(link);
    console.log('signin-bar ' + $('.signin-bar').length);
}


learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
};


learnjs.awsRefresh = function() {
    var deferred = new $.Deferred();
    AWS.config.credentials.refresh(function(err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(AWS.config.credentials.identityId);
        }
    });
    return deferred.promise();
};


learnjs.profileView = function() {
    var view = learnjs.template('profile-view');
    learnjs.identity.done(function(identity) {
        view.find('.email').text(identity.email);
    });
    return view;
}

function googleSignIn(googleUser) {
    function refresh() {
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'login'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            var newToken = userUpdate.getAuthResponse().id_token;
            creds.params.Logins['accounts.google.com'] = newToken;
            return learnjs.awsRefresh();
        });
    }
    console.log(googleUser.getAuthResponse().expires_in);
    console.log(googleUser.getAuthResponse().expires_at);
    // refresh();
    var id_token = googleUser.getAuthResponse().id_token;
    AWS.config.update({
        region: 'ap-northeast-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId:learnjs.poolId,
            Logins: {
                'accounts.google.com': id_token
            }
        })
    });
    return learnjs.awsRefresh().then(function(id){
        console.log('awsRefresh then');
        learnjs.identity.resolve({
            id:id,
            email:googleUser.getBasicProfile().getEmail(),
            refresh: refresh
        });
    });
}
