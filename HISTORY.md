# History

## [0.2.5](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.6) (16-04-2015)

- Fixed: `currentPage` was set only in a callback after route was created, and this broke `Rosso.currentPage()` in certain scenarios.
- Fixed: Added "dev" mode to Gruntfile.
- Test: Added test/example for a "redirect" route.


## [0.2.5](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.5) (22-01-2015)

- Fixed: Fixed an issue with routes calling push/pop/replace on the init method.
- Fixed: Fixed an issue with routes not having an init method.


## [0.2.4](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.4) (28-12-2014)

- Fixed: Specifying `main` file in package.json


## [0.2.3](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.3) (16-12-2014)

- Feature: The container for Rosso.js can now be a DOM node as well.


## [0.2.2](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.2) (17-11-2014)

- Feature: Rosso.getPath() is now public.
- Feature: Rosso.currentPage() returns the args for the current page. Additionally, the current `ctx` object is saved into every route (in `args.ctx`).


## [0.2.1](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.1) (07-11-2014)

- Feature: New build system to create standalone builds and with derequire.

This release should improve compatibility with AMD packages and others.


## [0.2.0](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.2.0) (06-11-2014)

- Feature: Added a new logic for middlewares that also supports 404 pages.

This is a breaking change.


## [0.1.2](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.1.2) (23-10-2014)

- Feature: `Rosso.replace()` replaces the current page without creating a new element in the browser's history.


## [0.1.1](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.1.1) (23-10-2014)

- Fixed: Fixed issues with `args.destroy()` never called.


## [0.1.0](https://github.com/EgoAleSum/Rosso.js/releases/tag/0.1.0) (22-10-2014)

Initial public release.
