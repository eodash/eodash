# @eodash/eodash [![Version](https://badgen.net/npm/v/@eodash/eodash)](https://www.npmjs.com/package/@eodash/eodash)

A package for creating earth observation dashboards. To learn more about eodash ecosystem visit [eodash.org](https://eodash.org)

## Usage

Checkout the [documentation](https://eodash.github.io/eodash/) for a detailed guide.

## Get Started

Install all the required dependecies after cloning or downloading the repository using Node v18 or higher:

```bash
npm run install
```

Run the dev server:

```bash
npm run dev
```

To compile and minify a demo instance:

```bash
npm run build
```

To preview the compiled production files :

```bash
npm run preview
```

To compile and minify a demo instance as a web component library:

```bash
npm run build -- --lib
```

## Folder Structure

    .
    ├── core               # CLI & Client source code
    ├── docs               # Documentation files
    ├── templates          # Base configurations and eodash templates
    ├── tests              # CLI & Client component tests folder
    ├── widgets            # Vue components as internal widgets.
    ├── public             # Statically served directory
    └── README.md

## Writing commits

To ensure clear communication with the package consumers and enable machine-readable commits, we adhere to [The Conventional Commits](https://www.conventionalcommits.org/) specification that allows the generation of [semVer](https://semver.org) releases and associated change logs using [googleapis/release-please](https://github.com/googleapis/release-please).

The most important prefixes you should have in mind are:

- fix: which represents bug fixes, and correlates to a SemVer patch.
- feat: which represents a new feature, and correlates to a SemVer minor.
- feat!:, or fix!:, refactor!:, etc., which represent a breaking change (indicated by the !) and will result in a SemVer major.
