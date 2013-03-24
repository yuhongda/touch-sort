window.onload = function () {
    var ids = localStorage['ids'];
    if (typeof ids != 'undefined') {
        ids = ids.split(',').reverse();
        for (var i = 0, len = ids.length; i < len; i++) {
            var section = document.getElementById(ids[i]);
            section.parentNode.insertBefore(section, document.getElementsByClassName('dragable')[0]);

        }
    }
}

var titles = document.getElementsByTagName('h2');
for (var i = 0, len = titles.length; i < len; i++) {
    titles[i].addEventListener('touchstart', function () { this.className = 'hover'; }, false);
    titles[i].addEventListener('touchend', function () { this.className = ''; }, false);
}

var links = document.getElementsByTagName('td'),
    tempClasses,j;
for (j = 0, len = links.length; j < len; j++) {
    links[j].addEventListener('touchstart', function () {
        tempClasses = this.className;
        this.className = 'hover';
    }, false);
    links[j].addEventListener('touchend', function () { this.className = tempClasses; }, false);
}

// drag&drop sort
var DraggableSortClass = (function () {
    var SupportsTouches = ("createTouch" in document),//判断是否支持触摸
        StartEvent = SupportsTouches ? "touchstart" : "mousedown",//支持触摸式使用相应的事件替代
        MoveEvent = SupportsTouches ? "touchmove" : "mousemove",
        EndEvent = SupportsTouches ? "touchend" : "mouseup",
        current = null,
        topblockHeight = document.getElementById('topblock').clientHeight + 70;
        $ = function (selector) {
            var items = [];
            if (selector.substring(0, 1) == '#') {
                return document.getElementById(selector.split('#')[1]);
            } else {
                var el = document.getElementsByClassName(selector.split('.')[1]);
                for (var i = 0, len = el.length; i < len; i++) {
                    items.push(el[i]);
                }
            }
            return items;
        },
        preventDefault = function (ev) {
            if (ev) ev.preventDefault();
            else window.event.returnValue = false;
        },
        getTouchPoint = function (ev) {
            var x = y = 0;
            var evt = ev.touches.item(0);

            x = evt.pageX;
            y = evt.pageY;
            return { 'x': x, 'y': y };
        },
        addEvent = function (ele, type, fn, param) {
            ele.addEventListener(type, function (event) { fn(event, param); }, false);
        };
    function _drag(opt) {
        this.el = typeof opt.el == 'string' ? $(opt.el) : opt.el;
        this.onstart = opt.start || new Function();//
        this.onmove = opt.move || new Function();
        this.onend = opt.end || new Function();
        this.action = false;
        this.lastY = 0;
        this.placeHolder = null;
        this.index = 0;// index to insert
        this.ismove = false;
        this.init();
    }
    _drag.prototype = {
        init: function () {
            var _offsetY = 0;
            for (var i = 0, len = this.el.length; i < len; i++) {
                var item = this.el[i],
                    _this = this;

                //item.style.top = _offsetY + 'px';
                //_offsetY += item.clientHeight+3;
                addEvent(item, 'touchstart', function (e, obj) {
                    //preventDefault(e);
                    if (_this.action) return false;
                    else _this.action = true;

                    for (var i = 0, len = _this.el.length; i < len; i++) {
                        _this.el[i].childNodes[3].style['max-height'] = '0';
                    }
                    this.ismove = false;

                    _this.startPoint = getTouchPoint(e);
                    obj.style['z-index'] = '9999';
                    obj.style.position = 'absolute';
                    _this.lastY = obj.style.top == '' ? 0 : parseInt(obj.style.top.substring(0, obj.style.top.length - 2), 10);
                    _this.current = obj;

                    this.placeHolder = document.createElement('section');
                    this.placeHolder.className = 'placeHolder';
                    this.placeHolder.style.height = '87px';
                    obj.parentNode.insertBefore(this.placeHolder, obj);

                    _this.onstart();
                }, item);
                addEvent(item, 'touchmove', function (e) {
                    preventDefault(e);
                    this.ismove = true;
                    _this.nowPoint = getTouchPoint(e);
                    _this.current.style.top = _this.nowPoint.y - topblockHeight + 'px';//+ _this.lastY

                    _this._index = (_this.nowPoint.y - topblockHeight) / 87 + 1;
                    _this.current.parentNode.removeChild($('.placeHolder')[0]);
                    _this.placeHolder = document.createElement('section');
                    _this.placeHolder.className = 'placeHolder';
                    _this.placeHolder.style.height = '87px';
                    if (parseInt(_this._index, 10) > 6) {
                        _this.current.parentNode.appendChild(_this.placeHolder);
                    } else {
                        _this.current.parentNode.insertBefore(_this.placeHolder, $('.dragable')[parseInt(_this._index, 10)]);
                    }

                    _this.onmove();
                });

                addEvent(item, 'touchend', function (e) {
                    document['on' + EndEvent] = document['ontouchcancel'] = document['on' + MoveEvent] = null;

                    if (!this.ismove) {
                        for (var i = 0, len = _this.el.length; i < len; i++) {
                            _this.el[i].childNodes[3].style['max-height'] = '0';
                        }
                        _this.current.childNodes[3].style['max-height'] = '9999px';

                        

                    } else {
                        _this.current.parentNode.insertBefore(_this.current, $('.dragable')[parseInt(_this._index, 10)]);

                        //save status to localstorage
                        var ids = [],
                            sections = $('.dragable');

                        for (var i = 0, len = sections.length; i < len; i++) {
                            ids.push(sections[i].id);
                        }
                        localStorage['ids'] = ids;
                    }
                    this.ismove = false;

                    //_this.lastY = _this.current.style.top == '' ? 0 : parseInt(_this.current.style.top.substring(0, _this.current.style.top.length - 2), 10);
                    _this.current.style.top = '0px';
                    _this.current.style.position = 'relative';
                    var placeHolders = $('.placeHolder');
                    for (var i = 0, len = placeHolders.length; i < len; i++) {
                        _this.current.parentNode.removeChild(placeHolders[i]);
                    }
                    _this.current.style['z-index'] = '9998';
                    _this.index = 0;
                    _this.action = false;
                    _this.onend();
                });

                addEvent(item, 'touchcancel', function () {
                    document['on' + EndEvent] = document['ontouchcancel'] = document['on' + MoveEvent] = null;
                    _this.current.style['z-index'] = '9998';
                    _this.action = false;
                    _this.onend(obj);
                });
            }
        },
        bind: function (fn, obj) {
            return function () {
                fn.apply(obj, arguments);
            }
        },
        tool: null
    }
    return function (opt) {
        return new _drag(opt);
    }
})();
var draggableSort = DraggableSortClass({
    el: '.dragable',
    start: function () {

    },
    move: function () {
       
    },
    end: function () {
       
    }
});