## Get Started
Install all the required dependecies after cloning or downloading the repository using Node v18 or higher:
```bash
npm run install
```
Run the dev server and the app will open your default browser window to the landing page:
```bash
npm run dev
```
To compile and minify for production:
```bash
npm run build
```
To preview the compiled production files :
```bash
npm run preview
```

## Folder Structure
    .
    ├── bin                # CLI source code
    ├── core               # Client source code that hosts the microfrontends and renders the dashboard
    ├── docs               # Documentation files
    ├── tests              # CLI and component tests folder
    ├── widgets            # Vue componenets as internal widgets.
    ├── public             # Statically served directory
    └── README.md


## Writing commits
To ensure clear communication with the package consumers and enable machine-readable commits, we adhere to [The Conventional Commits](https://www.conventionalcommits.org/) specification that allows the generation of [semVer](https://semver.org) releases and associated change logs using [googleapis/release-please](https://github.com/googleapis/release-please).

The most important prefixes you should have in mind are:
* fix: which represents bug fixes, and correlates to a SemVer patch.
* feat: which represents a new feature, and correlates to a SemVer minor.
* feat!:, or fix!:, refactor!:, etc., which represent a breaking change (indicated by the !) and will result in a SemVer major.
