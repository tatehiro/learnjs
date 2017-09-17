describe('LearnJS', function() {
    it('can show a problem view', function() {
        learnjs.showView('#problem-1');
        expect($('.view-container .problem-view').length).toEqual(1);
    });
    
    it('show the landing page view when there is no hash', function() {
        learnjs.showView('');
        expect($('.view-container .landing-view').length).toEqual(1);
    });

    it('passes the hash view parameter to the view function', function() {
        spyOn(learnjs, 'problemView');
        learnjs.showView('#problem-42');
        expect(learnjs.problemView).toHaveBeenCalledWith('42');
    });

    it('invokes the router when loaded', function() {
        spyOn(learnjs, 'showView');
        learnjs.appOnReady();
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });

    describe('problem view', function() {
        it('has a title that includes the problem number', function() {
            var view = learnjs.problemView('1');
            expect(view.find('.title').text()).toEqual('Problem #1');
        });
        it('shows the description', function() {
            var view = learnjs.problemView('1');
            expect(view.find('[data-name="description"]').text()).toEqual('What is truth?');
        });
        it('shows the problem code', function() {
            var view = learnjs.problemView('1');
            expect(view.find('[data-name="code"]').text()).toEqual('function problem() { return __; }');
        });
        it('subscribes to the hash change event', function() {
            learnjs.appOnReady();
            spyOn(learnjs, 'showView');
            $(window).trigger('hashchange');
            expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
        });
    });

    describe('answer section', function() {
        it('can check a correct answer by hitting a button', function() {
            var view = learnjs.problemView('1');
            view.find('.answer').val('true');
            view.find('.check-btn').click();
            expect(view.find('.result .correct-flash span').text()).toEqual('Correct!');
        });
        it('rejects an incorrect answer', function() {
            var view = learnjs.problemView('1');
            view.find('.answer').val('false');
            view.find('.check-btn').click();
            expect(view.find('.result').text()).toEqual('Incorrect!');
        });
        it('can show next link when correct answer', function(){
            var view = learnjs.problemView('1');
            view.find('.answer').val('true');
            view.find('.check-btn').click();
            expect(view.find('.result .correct-flash a').attr('href')).toEqual('#problem-2');
        });
        it('no link when correct last answer', function(){
            var view = learnjs.problemView('2');
            view.find('.answer').val('7');
            view.find('.check-btn').click();
            expect(view.find('.result .correct-flash a').attr('href')).toEqual('');
        });
    });
});