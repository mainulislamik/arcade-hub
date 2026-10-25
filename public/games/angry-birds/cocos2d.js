(function () {
    var d = document;
    var c = {
        COCOS2D_DEBUG: 0, //0: debug off, 1: basic debug, 2: full debug
        box2d: true,
        showFPS: false,
        frameRate: 60,
        tag: 'viewport',
        SingleEnginFile: 'cocos2d/cocos2dx.min.js',
        appFiles: ['game.js', 'main.js']
    };
    function boot() {
        if (d.getElementById('cocos2d-html5')) return;
        var s = d.createElement('script');
        s.src = c.SingleEnginFile;
        s.c = c;
        s.id = 'cocos2d-html5';
        d.body.appendChild(s);
    }
    if (d.readyState === 'complete' || d.readyState === 'interactive') {
        setTimeout(boot, 10);
    } else {
        window.addEventListener('DOMContentLoaded', boot);
        window.addEventListener('load', boot);
    }
})();
