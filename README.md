# jquery-phrase-translator
>


## Description
Multi-language translation of phrases defined by a unique id ("phrase-id")

Will translate any element added or modified using any of the following jQuery methods:

	$.fn.append, $.fn.appendTo,	$.fn.prepend, $.fn.before, $.fn.after, 
	$.fn.html, $.fn.text, $.fn.prop, and $.fn.attr (optional)

Uses one JSON-file containing the translations to all define language .

The elements to be translated must have attribute `lang` or (optional) a specified `class`

## Installation
### bower
`bower install https://github.com/FCOO/jquery-phrase-translator.git --save`

## Demo
http://FCOO.github.io/jquery-phrase-translator/demo/ 

## Usage

	var myPhraseTranslator = new PhraseTranslator( options );



### options
Option  | Type | Default | Description
:------------- | :-------------: | :------------------ | :----------------------------
`languageId` | `string` | `'en'` | Id of primary language 
`altLanguageId` | `string` | `'en'` | Id of alternative language. Used if no translation is available in primary language  
`classNames` | `string` | `null` | Class name(s) separated by space of class-names that elements will be translated 
`onlyLang` | `string` | `null` | By default all elements with attribute `lang` will be translated, but if `onlyLang` is specified, only elements with `lang == onlyLang` will be translated
`fileName`  | `string` | `""` | The name of the json-file with the phrases
`phrases`  | `JSON-object` | `null` | A JSON-object with the phrases
`callback`	| `function` | `null` | A function to be called after the translation is completed
`monitorAttr` | `boolean` | `false` | If true elements modified with `$.fn.attr` will also be translated  
`debug` | `boolean` | `false` | If true debug informations will be displayed in the browsers console 
`selectInConstructor` | `boolean` | `true` | If true the `select` method will be called when the constructor is finish. Set to false if you want to load and translate the phrases manually 
`attrList` | `Array` | `['title', 'alt', 'placeholder']` | List of attributes that will be translated. NOTE: If you changes any of the attributes directly using `$.fn.attr` the option `monitorAttr` must be true 

### Elements

All elements containing a phrase that need to be translated must have property `lang="xy"` (xy = any language code) or a specified class-name and contains the id for the phrases prefixed with `'#'`

	<h1 lang="en">#Header</h1>
	<input type="text" lang="en" title="#EnterYourName"/>
	<img lang="en" alt="#ClickToSave" src="..."/>


### JSON-data format
The JSON-file (`options.filename`) and JSON-object (`options.phrases`) passed to `.addPhrases(..)` (see below) have the following format:

	{
		"PHRASE_ID1": { TRANSLATION }, 
		"PHRASE_ID2": { TRANSLATION },
		...
		"PHRASE_IDN": { TRANSLATION }
	} 

Where `{ TRANSLATION }` contains

	{
		LANG_ID1: "The translation in LANG_ID1",
		LANG_ID2: "The translation in LANG_ID2",
		..
		LANG_IDN: "The translation in LANG_IDN"
	}

#### Example
	{
		"TheHeader": {
			en: "The header",
			da: "Overskriften"
		},
		"EnterYourName": {
			en: "Enter your name",
			da: "Indtast dit name"
		},
		"ClickToSave": {
			en: "Click to save",
			da: "Klik for at gemme"
		}
	}
	

### Methods

#### `addPhrases( jsonPhrases , update )`
Add the phrases in `jsonPhrases` 
If `update` is true `update()` is called

#### `select( languageId, altLanguageId )`
Change the language and update all elements 

	myPhaseTranslator.select( 'da', 'en' );

#### `update()`
Update all elements

#### `translate( phraseId, maskValueList, defaultValue )`
Simple function to return the text corresponding with phraseId (without leading '#')
`maskValueList = array of {mask, value}` where mask is replaced by value in the result
Eq.:

	myPhaseTranslator.addPhrases( {
		"HelloNAME" : {
			da: "Hej [NAME]!",
			en: "Hello [NAME]!"
		}
	});
	myPhaseTranslator.select( 'en' );

	myPhaseTranslator.translate('HelloNAME', [{mask:'[NAME]', value:'Niels'}]); //returns 'Hello Niels!'



## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-phrase-translator/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgements


## Known bugs

## Troubleshooting

## Changelog



