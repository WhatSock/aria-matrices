/*!
Visual ARIA Bookmarklet
Copyright 2015 Bryan Garaventa (http://whatsock.com/training/matrices/visual-aria.htm)
Part of the ARIA Role Conformance Matrices, distributed under the terms of the Open Source Initiative OSI - MIT License
*/

(function(){
	if (!document.getElementById('ws-bm-aria-matrices-lnk')){
		var s = document.createElement('span');
		s.className = 'WS-BM-Loading-Msg';
		s.innerHTML
			= '<span role="alert" style="position: fixed; z-index:10000; color: white; background-color: black; border: inset thick gray; top: 40%; left: 35%; padding: 20px; font-size: 18pt;">Loading Visual ARIA, please wait.</span>';
		document.body.appendChild(s);
	}

	var WSBMInit = function(attrs, isNested, check){
		attrs
			= 'aria-disabled,aria-readonly,aria-haspopup,aria-orientation,aria-label,aria-labelledby,aria-describedby,aria-pressed,aria-checked,aria-valuemin,aria-valuemax,aria-valuenow,aria-valuetext,aria-controls,aria-autocomplete,aria-expanded,aria-owns,aria-activedescendant,aria-posinset,aria-setsize,aria-level,role'.split(
				',');
		isNested = function(start, role){
			while (start){
				start = start.parentNode;

				if (start.getAttribute('role') == role)
					return 'true';
			}

			return 'false';
		};

		check = function(nodes, obj, frames, focused, pNode, focusHidden){
			nodes = document.querySelectorAll(
				'input, img[role], img[aria-label], img[aria-labelledby], img[aria-describedby], img[aria-haspopup="true"], img[aria-selected], progress');
			obj = {};

			for (var i = 0; i < nodes.length; i++){
				for (var j = 0; j < attrs.length; j++)
								obj[attrs[j]] = nodes[i].getAttribute(attrs[j]) || null;
				obj['node-name'] = nodes[i].nodeName.toLowerCase();
				obj.tabindex = nodes[i].getAttribute('tabindex');
				obj['input-type'] = obj['node-name'] == 'input' ? nodes[i].getAttribute('type') : null;

				if (obj.role == 'radio')
					obj['role-nested'] = isNested(nodes[i], 'radiogroup');

				else if (obj.role == 'tab')
					obj['role-nested'] = isNested(nodes[i], 'tablist');

				else if (obj.role == 'treeitem')
					obj['role-nested'] = isNested(nodes[i], 'tree');

				if (pNode != nodes[i].parentNode){
					pNode = nodes[i].parentNode;

					for (var a in obj){
						if (obj[a] || !isNaN(parseInt(obj[a])))
							pNode.setAttribute('data-ws-bm-' + a, obj[a]);

						else
							pNode.removeAttribute('data-ws-bm-' + a);
					}
				}
			}
			focused = document.querySelectorAll('*[aria-describedby]:focus');

			if (focused.length){
				var dbs = focused[0].getAttribute('aria-describedby').split(' ');

				for (var d = 0; d < dbs.length; d++){
					var t = document.getElementById(dbs[d]);

					if (t && t.nodeType === 1)
						t.setAttribute('data-ws-bm-db-match', dbs[d]);
				}
			}

			focusHidden = document.querySelectorAll('*[hidefocus="true"]');

			for (var h = 0; h < focusHidden.length; h++)
							focusHidden[h].removeAttribute('hidefocus');

			frames = document.querySelectorAll('frame, iframe');

			for (var f = 0; f < frames.length; f++){
				try{
					if (frames[f].contentDocument && frames[f].contentDocument.head && !frames[f].contentDocument.WSBMInit){
						frames[f].contentDocument.WSBMInit = WSBMInit;
						frames[f].contentDocument.WSBMInit();
					}
				}
				catch (e){}
			}

			setTimeout(check, 2000);
		};

		var checkNames = function(){

			var calcNames = function(node){
				if (!node || node.nodeType !== 1)
					return;

				var trim = function(str){
					if (typeof str !== 'string')
						return '';

					return str.replace(/^\s+|\s+$/g, '');
				}, walkDOM = function(node, fn, refObj){
					if (!node)
						return;
					fn(node, refObj);
					node = node.firstChild;

					while (node){
						walkDOM(node, fn, refObj);
						node = node.nextSibling;
					}
				}, isHidden = function(o, refObj){
					if (o.nodeType !== 1)
						return false;

					if ((o != refObj && o.getAttribute && o.getAttribute('aria-hidden') == 'true')
						|| (o.currentStyle && (o.currentStyle['display'] == 'none' || o.currentStyle['visibility'] == 'hidden'))
							|| (document.defaultView && document.defaultView.getComputedStyle && (document.defaultView.getComputedStyle(o,
								'')['display'] == 'none' || document.defaultView.getComputedStyle(o, '')['visibility'] == 'hidden'))
							|| (o.style && (o.style['display'] == 'none' || o.style['visibility'] == 'hidden')))
						return true;
					return false;
				}, hasParentLabel = function(start, targ, noLabel, rO){
					if (start == targ)
						return false;

					while (start){
						start = start.parentNode;

						if (start.getAttribute
							&& ((!noLabel && start.getAttribute('aria-label')) || isHidden(start, targ == document.body ? start : rO)))
							return true;

						else if (start == targ)
							return false;
					}

					return false;
				};

				if (isHidden(node) || hasParentLabel(node, document.body, true))
					return;

				var accName = '', accDesc = '', desc = '', aDescribedby = node.getAttribute('aria-describedby') || '',
					title = node.getAttribute('title') || '', skip = false;

				var walk = function(obj, stop, refObj){
					var nm = '';

					walkDOM(obj, function(o, refObj){
						if (skip || !o || (o.nodeType === 1 && isHidden(o, refObj)))
							return;

						var name = '';

						if (o.nodeType === 1){
							var aLabelledby = o.getAttribute('aria-labelledby') || '', aLabel = o.getAttribute('aria-label') || '',
								nTitle = o.getAttribute('title') || '';
						}

						if (o.nodeType === 1
							&& ((!o.firstChild || (o == obj && (aLabelledby || aLabel))) || (o.firstChild && o != obj && aLabel))){
							if (!stop && o == obj && aLabelledby){
								var a = aLabelledby.split(' ');

								for (var i = 0; i < a.length; i++){
									var rO = document.getElementById(a[i]);
									name += walk(rO, true, rO) + ' ';
								}
								name = trim(name);

								if (name)
									skip = true;
							}

							if (!name && aLabel){
								name = trim(aLabel);

								if (name && o == obj)
									skip = true;
							}

							if (!name && (o.nodeName.toLowerCase() == 'input' || o.nodeName.toLowerCase() == 'select') && o.id
								&& document.querySelectorAll('label[for="' + o.id + '"]').length){
								var rO = document.querySelectorAll('label[for="' + o.id + '"]')[0];
								name = trim(walk(rO, true, rO));
							}

							if (!name
								&& ((o.nodeName.toLowerCase() == 'input' && o.getAttribute('type') == 'image') || o.nodeName.toLowerCase()
									== 'img') && (trim(o.getAttribute('alt')) || nTitle)){
								name = trim(o.getAttribute('alt') || nTitle);
							}
						}

						else if (o.nodeType === 3){
							name = trim(o.data);
						}

						if (name && !hasParentLabel(o, obj, false, refObj)){
							nm += ' ' + name;
						}
					}, refObj);

					return nm;
				};

				accName = walk(node);

				if (title){
					desc = trim(title);
				}

				if (aDescribedby){
					var s = '', d = aDescribedby.split(' ');

					for (var j = 0; j < d.length; j++){
						var rO = document.getElementById(d[j]);
						s += walk(rO, true, rO) + ' ';
					}
					s = trim(s);

					if (s)
						desc = s;
				}

				if (desc)
					accDesc = desc;

				if (node.nodeName.toLowerCase() == 'input' || node.nodeName.toLowerCase() == 'img'
					|| node.nodeName.toLowerCase() == 'progress'){
					node.parentNode.setAttribute('data-ws-bm-name-prop', trim(accName));
					node.parentNode.setAttribute('data-ws-bm-desc-prop', trim(accDesc));
				}

				else{
					node.setAttribute('data-ws-bm-name-prop', trim(accName));
					node.setAttribute('data-ws-bm-desc-prop', trim(accDesc));
				}
			};

			var accNames =
				document.querySelectorAll(
					'input, select, button, a[href], progress, *[role="button"], *[role="checkbox"], *[role="link"], *[role="searchbox"], *[role="scrollbar"], *[role="slider"], *[role="spinbutton"], *[role="switch"], *[role="textbox"], *[role="combobox"], *[role="option"], *[role="menuitem"], *[role="menuitemcheckbox"], *[role="menuitemradio"], *[role="radio"], *[role="tab"], *[role="treeitem"]');

			for (var aN = 0; aN < accNames.length; aN++){
				calcNames(accNames[aN]);
			}

			setTimeout(checkNames, 5000);
		};

		setTimeout(checkNames, 5000);

		var l = document.createElement('link');
		l.type = 'text/css';
		l.rel = 'stylesheet';
		l.href = 'https://gutterstar.bizland.com/whatsock/training/matrices/visual-aria/roles.css';
		document.head.appendChild(l);

		check();
	};

	WSBMInit();

	if (!document.getElementById('ws-bm-aria-matrices-lnk')){
		var m = document.createElement('span');
		m.innerHTML
			= '<span id="ws-bm-aria-matrices-lnk" style="position: fixed; top: 0; left: 0;padding: 3px; border: 1px solid #dedede; background: #f5f5f5; filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#f9f9f9\', endColorstr=\'#f0f0f0\'); background: -webkit-gradient(linear, left top, left bottom, from(#f9f9f9), to(#f0f0f0)); background: -moz-linear-gradient(top,  #f9f9f9, #f0f0f0); border-color: #000; -webkit-box-shadow: 0 1px 1px #eaeaea, inset 0 1px 0 #fbfbfb; -moz-box-shadow: 0 1px 1px #eaeaea, inset 0 1px 0 #fbfbfb; box-shadow: 0 1px 1px #eaeaea, inset 0 1px 0 #fbfbfb;"><a style="display: inline-block; text-decoration: none; font-size: 12pt; padding: 6px 9px; border: 1px solid #dedede; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; background: #525252; filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#5e5e5e\', endColorstr=\'#434343\'); background: -webkit-gradient(linear, left top, left bottom, from(#5e5e5e), to(#434343)); background: -moz-linear-gradient(top,  #5e5e5e, #434343); border-color: #4c4c4c #313131 #1f1f1f; color: #fff; text-shadow: 0 1px 0 #2e2e2e; -webkit-box-shadow: 0 1px 1px #afafaf, inset 0 1px 0 #868686; -moz-box-shadow: 0 1px 1px #afafaf, inset 0 1px 0 #868686; box-shadow: 0 1px 1px #afafaf, inset 0 1px 0 #868686;" target="_blank" href="http://whatsock.com/training/matrices/"><span>ARIA Role Matrices</span></a></span>';
		document.body.appendChild(m);
	}
})();