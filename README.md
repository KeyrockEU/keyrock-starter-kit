# Keyrock Starter Kit

## System requirements

- Node.js
- `yarn` package manager

## Getting started

```sh
# clone this repo
git clone git@github.com:KeyrockEU/keyrock-starter-kit.git my-project
cd my-project

# install dependencies
yarn

# start server in development mode
yarn run dev
```

## Configuration

### How configuration works

The app configuration is handled by the [`config` package](http://npmjs.com/package/config), so in order to
fully understand how this works under the hood, we recommend to refer to its docs.

All configuration files lives inside the `config` directory. If you take a look, you will see files with names
like `default.json`, `production.json` and so on. The important here is `default.json`: it contains all the
defaults, that may or may not be overriden by your custom configuration, and/or environment-only configuration
(e.g., `production.json` will only be considered in the Production environment, i.e., when `NODE_ENV=production`).

The configuration files gets combined at runtime when the app starts, and in an incremental way:

- The first file considered always is `default.json`, so it works as a template;
- then, will look at the environment-specific file. If it does not exist, it will assume that the environment
  is development. If it is found, it will override the previous configuration with what's specified in this file;
- then will look at the `local.json` file. This is a special file, intended to hold configuration for some
  environment, that we don't want to commit to the repo (i.e., some super-secret credentials). If found, it will
  merge this configuration to the previous one.

For some typical dev environment, create a `config/development.json` file (which is ignored by `git` on purpose,
so there's no change to commit it accidentally) and drop your credentials there.

### Logging

Logging is done through the `logger` module, that you should import from `src/lib/util`.

`logger` exposes a `winston` instance, which has some handy functions:

- `verbose`
- `info`
- `warn`
- `error`

Each of one will log to the console, but with some goodies.

- `verbose(string)` is for logging information useful for debugging. Can be anything, and it is expected that the
  screen gets polluted of information. Anyway, try to be kind in the amount of information you send, have in mind
  that many exchanges can be active at the same time and logging stuff all the time.
- `info(string)` is for logging non-errors but expected situations, that occurs once in a while.
- `warn(string)` is for logging non-fatal error messages
- `error(Error, [object])` is for any kind of errors, but have in mind that the first parameter should be an
  `Error` object, in order to keep traceable the origin of the error. The second one is an arbitrary object. The
  error passed here should be logged to the screen, and sent to Bugsnag if enabled. The second argument will be
  shown in Bugnsag in tabs.

The words _verbose_, _info_, _warn_ and _error_ are also called "log levels". A log level is always set when the app starts, and defines which messages will show. The default log level (as defined in `default.json`) is `info`,
which means that only _info_, _warn_ and _error_ messages will be shown (excluding _verbose_).

This is the most balanced level, because it outputs information when the app starts, as well as errors. You can
see less information by setting a higher level (such as _warn_ or _error_) or see more by switching to a _verbose_
level. You can do it using one of this two methods:

1. By environment variable: start the app prepending the `LOG_LEVEL` variable as in `LOG_LEVEL=verbose yarn dev`.
2. By configuration file: edit your `config/development.json` and override the `logger.level` entry, like `{ "logger": { "level": "verbose" } }`, then start the app normally with `yarn dev`.

### Deployment

You can deploy the app to staging or production environments, as long as you have SSH access to the servers.
Each environment has associated a real server and a git branch. When you execute the deploy command, the remote
server will fetch the associated branch, execute some pre-deploy commands such as `yarn` and use PM2 to restart
the app.

**Note**: To know what environments are available and what branch deploys each one, take a look at the `process.json`
file, under the `deploy` entry.

The syntax to perform the deploy is:

```
yarn run deploy <environment> [<branch>]
```

The environment is mandatory and should be one of the configured ones in `process.json`.

The branch is optional, if you don't specify it, the configured branch will be used. This is what you want on
the 99% of cases.

Examples of deploy commands are:

```
yarn run deploy staging
yarn run deploy production
yarn run deploy staging chore/my-branch
```

The `deploy` task uses `pm2` under the hood. To know more about how it works,
[take a look at its docs](https://pm2.io/doc/en/runtime/guide/easy-deploy-with-ssh/). You'll want to refer to it
when you need to set up a new server.

### Other tasks

- `yarn test` to run unit tests
- `yarn run lint` to run the linter

Both tasks are run by the CI and makes it to fail if anyone fails.

- `yarn run stress-test` runs some tests against the Ocean endpoints.

## Contributing

Found a bug? [Open an issue](https://github.com/KeyrockEU/keyrock-starter-kit/issues/new). [Merge requests](https://github.com/KeyrockEU/keyrock-starter-kit/merge_requests/new) accepted too.
