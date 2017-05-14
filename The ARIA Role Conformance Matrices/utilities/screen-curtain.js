/*!
The Screen Curtain Bookmarklet
To assist sighted users in testing web pages using a screen reader by simulating blindness.
Suggested by Laurence Lewis, written by Bryan Garaventa, 05/12/2017
*/

(function(){

	// Bind fn
	var bind = function(obj, type, fn){
		if (obj.attachEvent){
			obj["e" + type + fn] = fn;
			obj[type + fn] = function(){
				obj["e" + type + fn](window.event);
			}
			obj.attachEvent("on" + type, obj[type + fn]);
		}

		else if (obj.addEventListener)
			obj.addEventListener(type, fn, false);
		return obj;
	},

	// unbind fn
	unbind = function(obj, type, fn){
		if (obj.detachEvent){
			obj.detachEvent("on" + type, obj[type + fn]);
			obj[type + fn] = null;
		}

		else if (obj.removeEventListener)
			obj.removeEventListener(type, fn, false);
		return obj;
	},

	// key handler
	escKey = function(ev){
		var ev = ev || window.event, k = ev.which || ev.keyCode;

		if (k == 27 && ev.shiftKey){
			document.body.removeChild(curtain);
			setTimeout(function(){
				unbind(document.body, 'keydown', escKey);
				unbind(document.body, 'mousedown', mouseClick);
			}, 1);

			if (ev.preventDefault)
				ev.preventDefault();

			else
				return false;
		}
	},

	// mouse click handler
	mouseClick = function(ev){
		var ev = ev || window.event;

		if (ev.shiftKey){
			document.body.removeChild(curtain);
			setTimeout(function(){
				unbind(document.body, 'keydown', escKey);
				unbind(document.body, 'mousedown', mouseClick);
			}, 1);

			if (ev.preventDefault)
				ev.preventDefault();

			else
				return false;
		}
	},

	// curtain element container
	curtain = document.createElement('div');

	curtain.innerHTML
		= '<div style="background-color: #000; position: fixed; z-index: 10000; left: 0; top: 0; height: 100%; width: 100%;" id="ws-screen-curtain-id"><span style="float: left; padding: 10px 20px; background-color: #fff; color: #000; margin-top: 35%; margin-left: 30%;">To cancel, press Shift+Escape on the keyboard,<br />or Shift+LeftClick with the mouse.</span></div>';

	if (document.body){

		document.body.appendChild(curtain);

		bind(document.body, 'keydown', escKey);
		bind(document.body, 'mousedown', mouseClick);

		setTimeout(function(){
			var sc = document.getElementById('ws-screen-curtain-id');

			if (sc)
				sc.innerHTML = '&nbsp;';
		}, 3500);
	}
})();