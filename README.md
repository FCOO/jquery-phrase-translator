# jquery-phrase-translator

Multi-language translation of phrases defined by a unique id ("phrase-id")

Will translate any element added or modified using any of the following jQuery methods:

	$.fn.append, $.fn.appendTo,	$.fn.prepend, $.fn.before, $.fn.after, 
	$.fn.html, $.fn.text, $.fn.prop, and $.fn.attr (optional)

Uses one xml-file containing the translations to all define language .

The elements to be translated must have attribute `lang` or (optional) a specified `class`

## Installation
### bower
`bower install https://github.com/NielsHolt/jquery-phrase-translator.git --save`

## Operating instructions
	var myPhraseTranslator = new PhraseTranslator( options );

Change the language using `select( languageId, altLanguageId )`
	
	myPhaseTranslator.select( 'da', 'en' );

## Configuration instructions

### Options
`options` has the following attributes

Option  | Type | Default | Description
:------------- | :-------------: | :------------------ | :----------------------------
`languageId` | `string` | `'en'` | Id of primary language 
`altLanguageId` | `string` | `'en'` | Id of alternative language. Used if no translation is available in primary language  
`classNames` | `string` | `null` | Class name(s) separated by space of class-names that elements will be translated 
`onlyLang` | `string` | `null` | By default all elements with attribute `lang` will be translated, but if `onlyLang` is specified, only elements with `lang == onlyLang` will be translated
`fileName`  | `string` | `'phrases.xml'` | The name of the xml file with the phrases 
`callback`	| `function( phraseTrans )` | `null` | A function to be called after the translation is completed
`monitorAttr` | `boolean` | `false` | If true elements modified with `$.fn.attr` will also be translated  
`debug` | `boolean` | `false` | If true debug informations will be displayed in the browsers console 
`attrList` | `Array` | `['title', 'alt', 'placeholder']` | List of attributes that will be translated. NOTE: If you changes any of the attributes directly using `$.fn.attr` the option `monitorAttr` must be true 


### Elements

All elements containing a phrase that need to be translated must have property `lang="xy"` (xy = any language code) or a specified class-name and contains the id for the phrases prefixed with `'#'`

	<h1 lang="en">#Header</h1>
	<input type="text" lang="en" title="#EnterYourName"/>
	<img lang="en" alt="#ClickToSave" src="..."/>

### xml-file
The xml-file must contain the phrase translation a la

	...
	<phrase id="Header">
		<en>The header</en>
		<da>Overskriften</da>
	</phrase>	
	<phrase id="EnterYourName">
		<en>Enter your name</en>
		<da>Indtast dit name</da>
	</phrase>
	<phrase id="ClickToSave">
		<en>Click to save</en>
		<da>Klik for at gemme</da>
	</phrase>
	...





## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/NielsHolt/jquery-phrase-translator/LICENSE).

Copyright (c) 2015 [Niels Holt](https://github.com/NielsHolt)

## Contact information

Niels Holt <niels@steenbuchholt.dk>


## Credits and acknowledgements

Based on the great work by [Irrelon/jquery-lang-js](https://github.com/irrelon/jquery-lang-js)

## Known bugs

## Troubleshooting

## Changelog



