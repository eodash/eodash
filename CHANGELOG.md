# Changelog

## [5.0.0-alpha.2.5](https://github.com/eodash/eodash/compare/eodash-v5.0.0-alpha.2.4...eodash-v5.0.0-alpha.2.5) (2024-06-13)


### Features

* add trasition ([790442d](https://github.com/eodash/eodash/commit/790442dca2373ade870226655a3cc3e29e098231))
* change panels layout in functional widgets ([3bfdcca](https://github.com/eodash/eodash/commit/3bfdccac4e0cc20ac14377e1aafcdd8858e5b12c))
* converted stacinfo to functional widget ([e959c90](https://github.com/eodash/eodash/commit/e959c9034d329eb47cd73ddb3cc0effb6c711e46))
* replacing time selection with VCalendar, adding visualization of available datasets and jump to latest function ([f780699](https://github.com/eodash/eodash/commit/f780699c23d345cc79f648c5dd1bd21dadb02bec))


### Bug Fixes

* central loading of initial indicator ([cc43a51](https://github.com/eodash/eodash/commit/cc43a51ca360260527eb09028fb4d8071385bce8))
* EodashCollection types + warning collections with no items in dev ([5c348e2](https://github.com/eodash/eodash/commit/5c348e25cea02fefefaa8b7988bacd3df9275a08))
* Flash of Unstyled Content in Web Component ([#38](https://github.com/eodash/eodash/issues/38)) ([f07c298](https://github.com/eodash/eodash/commit/f07c2980f679106884fbffa59b0fb3bf54d3ef95))
* handling runtime config ([51bc881](https://github.com/eodash/eodash/commit/51bc881705cecf1b3018345b360283b0ffe54059))
* panel heights on mobile ([6b3fc5c](https://github.com/eodash/eodash/commit/6b3fc5c40d3e0883cef562e4f67ada86405f1d0a))
* remove google font fetching ([22e8821](https://github.com/eodash/eodash/commit/22e88215957133c8dcea69560b2d997d0848c586))
* suppress `/config` vite warning ([f829001](https://github.com/eodash/eodash/commit/f829001380913a435468bdf656c36f4d7d12f894))
* update tests ([8397346](https://github.com/eodash/eodash/commit/839734631d00cc4468d718a54c4ce4a555cc63d4))

## [5.0.0-alpha.2.4](https://github.com/eodash/eodash/compare/eodash-v5.0.0-alpha.2.3...eodash-v5.0.0-alpha.2.4) (2024-06-03)


### Bug Fixes

* Flash of Unstyled Content in Web Component ([#38](https://github.com/eodash/eodash/issues/38)) ([8bb3e63](https://github.com/eodash/eodash/commit/8bb3e6383bfde71c06f6b475e517100e53e06cfe))

## [5.0.0-alpha.2.3](https://github.com/eodash/eodash/compare/eodash-v5.0.0-alpha.2.2...eodash-v5.0.0-alpha.2.3) (2024-05-23)


### Features

* Introduce Error Alert Banner ([#27](https://github.com/eodash/eodash/issues/27)) ([1bf741f](https://github.com/eodash/eodash/commit/1bf741fbae3404dfa08e04ec762efd38ecb28052))


### Bug Fixes

* Automate Release ([#35](https://github.com/eodash/eodash/issues/35)) ([3ffb091](https://github.com/eodash/eodash/commit/3ffb091d5c3b1fad4c150949120048fac37b1d36))

## [5.0.0-alpha.2.2](https://github.com/eodash/eodash/compare/eodash-v5.0.0-alpha.2.1...eodash-v5.0.0-alpha.2.2) (2024-05-22)


### ⚠ BREAKING CHANGES

* Introducing Eodash Web Component ([#23](https://github.com/eodash/eodash/issues/23))

### Features

* add footerText property to the config ([af7d985](https://github.com/eodash/eodash/commit/af7d9853fc629f9bdc8ef98121d45a0e969a080b))
* Added cli flags for server configurations ([#8](https://github.com/eodash/eodash/issues/8)) ([30afc9c](https://github.com/eodash/eodash/commit/30afc9cc6ad07c0474060a3097b60b77e7f0d688))
* adding additional handling of stac collections in map ([3e8af74](https://github.com/eodash/eodash/commit/3e8af744c8ddcc1a6ec080e42391b0fd3f1c4a83))
* adding core itemfilterwidget; loading of state based on kvp values for indicator, time and position; chore: ran prettier on some of the files ([590f9a7](https://github.com/eodash/eodash/commit/590f9a75dfdf3e7b295131b5d4930e2969ea2ca0))
* adding doc building and deployment to gh-pages for main branch ([796dabe](https://github.com/eodash/eodash/commit/796dabe92b889e15f44debc4afa591006d5bb265))
* adding links to eodash and eox in footer ([dc55306](https://github.com/eodash/eodash/commit/dc55306ea56b4ec6c53d521ba611bc14671b299d))
* Adding SEO metadata configuration ([#15](https://github.com/eodash/eodash/issues/15)) ([ef441fc](https://github.com/eodash/eodash/commit/ef441fc96b01b4e6e3ff764e6de3817593e2356b))
* adding time selection widget to config ([b69efb7](https://github.com/eodash/eodash/commit/b69efb7e64a51444f8d1bd109e15e6cd061c8f4f))
* changing default footer branding ([0e32819](https://github.com/eodash/eodash/commit/0e32819a63a7e23ddf568a90e6659343a6631801))
* Enable splitting the instance entry point ([#12](https://github.com/eodash/eodash/issues/12)) ([f75b585](https://github.com/eodash/eodash/commit/f75b585c5eef91f5e7542279a85bfd6e3233a9b5))
* enable/disable widget sliding from config ([4ffab15](https://github.com/eodash/eodash/commit/4ffab151b7534aff4f95a949a1d64ba7edeab569))
* guide concept ([7fd4a46](https://github.com/eodash/eodash/commit/7fd4a46bbad7142e1a5870537ee875210c5c5106))
* Introduce Component Testing,Types and Linting CI Pipelines ([#2](https://github.com/eodash/eodash/issues/2)) ([34dfe81](https://github.com/eodash/eodash/commit/34dfe81a81d1a8638f91ae019e91b13e0523a5db))
* introduce loading config ([f986234](https://github.com/eodash/eodash/commit/f986234196df36cc8c2cdb90275a35c25a3eba9a))
* introduce release please ([#28](https://github.com/eodash/eodash/issues/28)) ([fa38aec](https://github.com/eodash/eodash/commit/fa38aec92b49a1f87ba482c3728692f72df5fe3a))
* Introducing CLI Config File ([#10](https://github.com/eodash/eodash/issues/10)) ([2b3b67d](https://github.com/eodash/eodash/commit/2b3b67d0264bf611ffb4d3df121b925c298f31e2))
* Introducing Documentation Site ([#14](https://github.com/eodash/eodash/issues/14)) ([133bcb7](https://github.com/eodash/eodash/commit/133bcb7777ea6822c7b4208dde1b8fb727b0b592))
* Introducing Eodash Web Component ([#23](https://github.com/eodash/eodash/issues/23)) ([5f674ad](https://github.com/eodash/eodash/commit/5f674ad7f8377965e420877f8d59d4f21e41ed56))
* Introduction to eodash CLI ([#1](https://github.com/eodash/eodash/issues/1)) ([e1d2596](https://github.com/eodash/eodash/commit/e1d2596aa3974e5dd116e8278b201144e900c8f8))
* Support user defined internal widgets ([#13](https://github.com/eodash/eodash/issues/13)) ([0dca9b3](https://github.com/eodash/eodash/commit/0dca9b3ebd89f2eefea87d84f1c93d67062bccc9))
* vtabs for mobile ([5c68d70](https://github.com/eodash/eodash/commit/5c68d70c1b1034e297271a6ccd128c19b2af1584))


### Bug Fixes

* add ts-expect-error ([e34372f](https://github.com/eodash/eodash/commit/e34372f4c93c0e7e17fbaa891a6ac88ac26be801))
* adding base path to doc build step ([8c86b7c](https://github.com/eodash/eodash/commit/8c86b7c527ad7841881411ddd48ad436cb94b6cf))
* cleanup and fixes ([#9](https://github.com/eodash/eodash/issues/9)) ([b75ad5b](https://github.com/eodash/eodash/commit/b75ad5b88b070d10081de9a3cf0d5e9a5e8dec7f))
* date picker validation ([fffffab](https://github.com/eodash/eodash/commit/fffffabfcb2f39c0f30f4700ed8a7309de34393f))
* EodashDatePicker size ([1659de3](https://github.com/eodash/eodash/commit/1659de335a242fabc2ddc7667f57919f7a0c4b17))
* general fixes ([#24](https://github.com/eodash/eodash/issues/24)) ([d756288](https://github.com/eodash/eodash/commit/d7562885753bf29e30c50412c26381590f397108))
* reference not found on doc build ([66c86c6](https://github.com/eodash/eodash/commit/66c86c6eb503cda9f09f9b98f661361d933d5576))
* Release please ([#29](https://github.com/eodash/eodash/issues/29)) ([7c51eb8](https://github.com/eodash/eodash/commit/7c51eb8dde4044c7edb7648a50d19fcef83bf160))
* Release Please ([#30](https://github.com/eodash/eodash/issues/30)) ([2d1f07d](https://github.com/eodash/eodash/commit/2d1f07d499d3ecc1801adc20678cbe14f31cd906))
* remove border radius from items ([bb8a121](https://github.com/eodash/eodash/commit/bb8a121abb7dfd0431dcc836598a7dad033000dc))
* remove logo from public folder ([1f53d1f](https://github.com/eodash/eodash/commit/1f53d1f1a95e8e1fe420f9c39714c9e300144faa))
* rename internal type widget `props` to `properties` ([6c28e78](https://github.com/eodash/eodash/commit/6c28e785f2eb9eb48bdb29bcc57e9b30e6503229))
* type defs ([1a6532c](https://github.com/eodash/eodash/commit/1a6532caf8721e29f7944c5297792c67f032ae00))
