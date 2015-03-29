# jquery-phrase-translator * * README.md NOT finish * *

Multi-language translation of phrases defined by a unique id ("phrase-id")

Uses one xml-file containing the translations to all define language .

## Installation
### bower
`bower install https://github.com/NielsHolt/jquery-phrase-translator.git --save`

TODO:
	- Configuration instructions
	- Installation instructions
	- Operating instructions


## Usage

All elements containing a phrase that need to be translated must have property `lang="cl"` (cl = Current Language) and contains the id for the phrases prefixed with `'#'`

	<h1 lang="cl">#Header</h1>
	<input type="text" lang="cl" title="#EnterYourName"/>
	<img lang="cl" alt="#ClickToSave" src="..."/>

The xml-file must also have a enterty a la

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



##Copyright and License
This plugin is licensed under the [MIT license](https://github.com/NielsHolt/jquery-phrase-translator/LICENSE).

Copyright (c) 2015 [Niels Holt](https://github.com/NielsHolt)

##Contact information

Niels Holt <niels@steenbuchholt.dk>


##Credits and acknowledgements

Based on the great work by [Irrelon/jquery-lang-js](https://github.com/irrelon/jquery-lang-js)

##Known bugs

##Troubleshooting

##Changelog



