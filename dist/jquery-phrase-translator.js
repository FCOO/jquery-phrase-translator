/****************************************************************************
	jquery-phrase-translator.js, 

	(c) 2015, FCOO

	https://github.com/FCOO/jquery-phrase-translator
	https://github.com/FCOO

	Based on https://github.com/coolbloke1324/jquery-lang-js

****************************************************************************/

;(function ($, window, document, undefined) {
	"use strict";
	
	function PhraseTranslator( options ) {
		this.VERSION = "1.2.1";
		this.options = $.extend({
			//Default options
			languageId					: 'en', 
			altLanguageId				: 'en', 
			classNames					: '',		//string classes separeted by space
			onlyLang						: '',
			fileName						: '', 
			callback						: null,
			monitorAttr					: false,
			debug								: false,
			selectInConstructor	: true,
			attrList						: ['title', 'alt', 'placeholder']

		}, options || {} );

		var self = this;

		this.phrases = this.phrases || {}; //json-object with current translation. Is set in this.update();
		this.jsonPhrasesList = []; //List of json-objects with phrases. See readme.md for description. Ex: { "header": {"en":"Header", "da":"Overskrift"}, ... }

		//If a json-file is given => read it and save it in this.jsonPhrasesList
		this.addPhraseFile( this.options.fileName );

		//Create childrenSelector, globalSelector, and classRegExp (regexp) to check if elements has one of the classes in options.classNames or classes added using addClassNames(..)
		this.childrenSelector = '[lang' + (this.options.onlyLang ? '="'+this.options.onlyLang+'"' : '') + ']';
		this.globalSelector		= ':not(html)'+this.childrenSelector;
		this.classRegExpStr = '';
		this.classRegExp = '';

		//Add the classes given by options.classNames
		this.addClassNames( this.options.classNames );
		
		// Store existing mutation methods so we can auto-run translations when new data is added to the page
		this._jQueryMutationCopies = {
			append	: $.fn.append,
			appendTo: $.fn.appendTo,
			prepend	: $.fn.prepend,
			before	: $.fn.before,
			after		: $.fn.after,
			html		: $.fn.html,

			text		: $.fn.text,
			attr		: $.fn.attr,
			prop		: $.fn.prop
		};

		// Now override the existing mutation methods with our own
		$.fn.append		= function () { return self._jQueryMutation(this, 'append'	, arguments); };
		$.fn.appendTo = function () { return self._jQueryMutation(this, 'appendTo', arguments); };
		$.fn.prepend	= function () { return self._jQueryMutation(this, 'prepend'	, arguments); };
		$.fn.before		= function () { return self._jQueryMutation(this, 'before'	, arguments); };
		$.fn.after		= function () { return self._jQueryMutation(this, 'after'		, arguments); };
		$.fn.html			= function () { return self._jQueryMutation(this, 'html'		, arguments); };

		$.fn.text			= function () { return self._jQueryMutation(this, 'text'		, arguments); };
		$.fn.prop			= function () { return self._jQueryMutation(this, 'prop'		, arguments); };

		if (this.options.monitorAttr){
			$.fn.attr			= function () { return self._jQueryMutation(this, 'attr'		, arguments); };
		}
	
	
		//Load the data when $(document).ready
		if (this.options.selectInConstructor){
			$(function () {
				self.select( self.options.languageId, self.options.altLanguageId );		
			});
		  
		}


	}
  
  // expose access to the constructor
  window.PhraseTranslator = PhraseTranslator;


	//Extend the prototype
	window.PhraseTranslator.prototype = {

		//'Save' original version of text, attr, and prop. 
		fnGetText: function($element						) { return this._jQueryMutationCopies.text.call( $element); },
		fnSetText: function($element, arg1			) { return this._jQueryMutationCopies.text.call( $element, arg1); },
		fnGetAttr: function($element, arg1			) { return this._jQueryMutationCopies.attr.call( $element, arg1); },
		fnSetAttr: function($element, arg1, arg2) { return this._jQueryMutationCopies.attr.call( $element, arg1, arg2); },

		//_jQueryMutation overwrites
		_jQueryMutation: function(context, method, args) { 
			var result = this._jQueryMutationCopies[method].apply(context, args),
					$context = $(context),
					$contextLang = this.fnGetAttr($context, 'lang'),
					$contextClass = this.fnGetAttr($context, 'class');


			if	(
						( $contextLang && ( !this.options.onlyLang || (this.options.onlyLang == $contextLang) ) ) ||
						( this.classRegExp && ($contextClass !== undefined) && this.classRegExp.test(' ' + $contextClass +' ') ) 
					){			
				//If it is a request for text or html => just return the result
				if ((args.length === 0) && ((method=='text') || (method=='html'))){
					return result;			  
				}

				//If it is a prop or attr => transelate attributes (if assigned) and return the result
				if ((method=='attr') || (method=='prop')){
					if ( (args.length >= 2) || $.isPlainObject( args[0] ) ){
						this._translateAttr( $context );
					}	
					return result;			  
				}	
				this._translateElement( $context );
			}	
			this._translateAll( $context );
			return result;			
		},
		
		//**************************************************************
		_isValidPhraseId: function( phraseId ){
			return phraseId ? phraseId.charAt(0) == '#' : false;
		},

		//**************************************************************
		_translateAll: function( $selector ){
			var self = this;
			$selector = $selector ? $selector.find(this.childrenSelector) : $( this.globalSelector );

			$selector.each( function(){ self._translateElement( $(this) ); });
		},

		//**************************************************************
		_translateElement: function( $element ){
			var contents = '',
					phraseData = $element.data('phrase-translator-contents') || '',
					contentsLang = $element.data('phrase-translator-contents-lang') || '',
					translate = (contentsLang != this.options.languageId);

			//Get the contents of the element and check if it is a phrase-code
			var elementIsInput = false;
			// Check if the element is an input element
			if ($element.is('input')) {
				switch (this.fnGetAttr($element, 'type')) {
					case 'button':
					case 'submit':
					case 'reset':
						contents = $element.val();
						elementIsInput = true;
					break;
				}
			} else {
				// Get the (first) text node inside this element
				var $textNode = $element.contents()
												.filter(function () {return this.nodeType === 3; })
												.first();
				contents = this.fnGetText( $textNode ); 
			}

			//If the contents is a phrase-code => use it when translating
			if (this._isValidPhraseId( contents )){ 
				phraseData = contents;							
				translate = true; 
			}

			//If phraseData contains a valid phrse-code => translate it into text
			if (phraseData && translate) {
				contents = this._translate( phraseData );
			  if (elementIsInput) {
					$element.val( contents );
				} else {
					this.fnSetText( $element, contents ); 
				}
			}

			//Translate the attributes of the element
			this._translateAttr( $element );

			//Set the phrase-translator-contents with the phrase-codes for the different attributes
			$element.data('phrase-translator-contents', phraseData);
			$element.data('phrase-translator-contents-lang', this.options.languageId);
		},
		
		
		//**************************************************************
		_translateAttr: function( $element ){
			var attr, attrValue,
					phraseData = $element.data('phrase-translator-attr') || {},
					attrLang = $element.data('phrase-translator-attr-lang') || '',
					translate,
					isNewLang = (attrLang != this.options.languageId);
					

			for (var i=0; i<this.options.attrList.length; i++ ){
				translate = isNewLang;
				attr = this.options.attrList[i];
				attrValue = this.fnGetAttr($element, attr) || '';
				//If the $element.attr(attr) is a phrase-code => translate if
				if ( this._isValidPhraseId(attrValue) ){
					phraseData[attr] = attrValue;							
					translate = true; 
				}

				//If phraseData[attr] contains a valid phrase-codes => translate it into text
				if (phraseData.hasOwnProperty(attr) && translate) {
					this.fnSetAttr( $element, attr, this._translate( phraseData[attr] ));
				}	
			}
					
			//Set the data-phrase-translator with the phraseCodes for the different attributes
			$element.data('phrase-translator-attr', phraseData);
			$element.data('phrase-translator-attr-lang', this.options.languageId);
		},
		

		//**************************************************************
		_translate: function( phraseHashId, defaultValue ){
			return this._isValidPhraseId(phraseHashId) ? this.phrases[ phraseHashId.slice(1) ] : (defaultValue || phraseHashId);
		},


		
		
		/**************************************************************
		Public methods
		**************************************************************/
	
		/* 
		translate(phraseId, maskValueList, defaultValue)
		Simple function to return the text cooresponding with phraseId (without leading '#')
		maskValueList = array of {mask, value} where mask is replaced by value in the result
		Eq.:
			if _translate('#HelloNAME') returns 'Hello [NAME]!' then
			translate('HelloNAME', [{mask:'[NAME]', value:'Niels'}]) will return 'Hello Niels!'
		*/
		translate: function(phraseId, maskValueList, defaultValue){
			var result = this._translate( '#'+phraseId, defaultValue );
			if (maskValueList && result){
				for (var i=0; i<maskValueList.length; i++ )
				result = result.replace(maskValueList[i].mask, maskValueList[i].value);  
			}
			return result || '#'+phraseId;
		},

		//**************************************************************
		addPhrases: function( jsonPhrases , update ){
			this.jsonPhrasesList.push(jsonPhrases); 
			if (update)
				this.update();
		},

		//**************************************************************
		addPhraseFile: function( fileName, update ){
			if (fileName){
				$.ajax({
					url			: fileName,
				  async		: false,
					dataType: 'json',
					error		: function( err  ) { console.log('phrase-translator: Error loading "' + fileName + '".', 'Error-text='+err.statusText +'. Error-obj:', err); },
					success	: $.proxy( this.addPhrases, this )
				});
			}
			
			if (update)
				this.update();
		},

		//**************************************************************
		addClassNames: function( classNames, update ){
			classNames = classNames || '';
			var i, nextClass, classList = this.options.classNames.split(' ');
			for (i=0; i<classList.length; i++ ){
				nextClass = $.trim( classList[i] );
				if (nextClass){
					this.classRegExpStr += (this.classRegExpStr?'|':'') + '\\s' + nextClass + '\\s';			  
					this.addSelectors('.'+nextClass);
				}
			}
			this.classRegExp = this.classRegExpStr ? new RegExp(this.classRegExpStr) : null;

			if (update)
				this.update();
		},

		//**************************************************************
		addSelectors: function( selectors, update ){
			var i, selector;
			selectors = $.isArray( selectors ) ?  selectors : [selectors];
			for (i=0; i<selectors.length; i++ ){
				selector = selectors[i];
				this.childrenSelector += ','+selector;
				this.globalSelector		+= ','+selector;
			}
			if (update)
				this.update();
		},

		//**************************************************************
		select: function( languageId, altLanguageId ){
			this.options.languageId = languageId;		
			this.options.altLanguageId = altLanguageId || this.options.altLanguageId || 'en';		
			this.update();
		},

		//**************************************************************
		update: function(){
			var i, jsonPhrases, jsonPhrase, phraseId, transTxt;

			this.phrases = {};

			for (i=0; i<this.jsonPhrasesList.length; i++ ){
				jsonPhrases = this.jsonPhrasesList[i];

				for (phraseId in jsonPhrases) {
					if (jsonPhrases.hasOwnProperty(phraseId)) {
						
						jsonPhrase = jsonPhrases[ phraseId ];
						//Translate
						transTxt = jsonPhrase[ this.options.languageId ];

						//If no translation is given => use altLanguageId
						if (!transTxt && this.options.altLanguageId){
							transTxt = jsonPhrase[ this.options.altLanguageId ];
							if (this.options.debug)
								console.log('phrase-translator: "' + phraseId +'" not defined for language "' + this.options.languageId + '". Using "'+transTxt+'" from "'+this.options.altLanguageId+'" instead');
						}

						//If the translation already exists: Use last version (non-empty)
						if (this.phrases[ phraseId ]){
							transTxt = transTxt || this.phrases[ phraseId ];
							if ( this.options.debug )
								console.log('phrase-translator: Two or more translations for  "' + phraseId + '". Using "' + transTxt +'"');  
						}						

						//Add translation
						this.phrases[ phraseId ] = transTxt;
					}
				}
			}
			
			//Translate all elements			
			this._translateAll();
			
			if (this.options.callback)
				this.options.callback( this );
		}
	};

	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { //"$( function() { ... });" is short for "$(document).ready( function(){...});"

	
	}); //End of initialize/ready
	//******************************************

}(jQuery, this, document));