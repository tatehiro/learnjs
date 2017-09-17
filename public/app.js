'use strict';
var learnjs = {};
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


learnjs.appOnReady = function() {
    window.onhashchange = function() {
        console.log('hashchange');
        learnjs.showView(window.location.hash);
    };
    console.log('showview');
    learnjs.showView(window.location.hash);
};