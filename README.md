# antidote-web

[![Build Status](https://travis-ci.org/nre-learning/antidote-web.svg?branch=master)](https://travis-ci.org/nre-learning/antidote-web)

This repository is where the web-front end for the Antidote platform is maintained. This is what makes the [NRE Labs](https://nrelabs.io) experience possible, by blending back-end smarts with a sleek, front-end interface.

If you're looking for the back-end services for Antidote, that code is maintained in a separate repository: [`antidote-core`](https://github.com/nre-learning/antidote-core).

The [Antidote documentation](https://docs.nrelabs.io/antidote/antidote-architecture) contains additional architectural details

## Development

> This repository is the convergence of all projects related to the Antidote front-end. What's housed here is the top-level templates for defining the Antidote front-end, build scripts, packaging, etc. However, other repositories serve specific purposes in creating this front-end experience and are listed as dependencies for this project. See `src/package.json` for a list of these dependencies. If you are working on one of those dependencies, you'll likely want to change this configuration to point to a local directory where you've cloned the relevant project, and use this repository's build tools to put the whole thing together.

For rapid iteration on developing antidote-web, you can run a lightweight version of the antidote stack using the following steps. This approach removes the need for running a fully functioning stack (i.e. kubernetes) by running the back-end (`antidote-core`) with the scheduler service entirely disabled, and only running the antidote API. This allows you to manually set the exact back-end state that you want, so that front-end features can be easily developed and tested.

**IMPORTANT** - The first thing you'll need, beyond cloning this repository (`antidote-web`) is to also clone an Antidote curriculum. Any compatible curriculum will do, but the simplest one built for development is the [`antidote-test-curriculum`](https://github.com/nre-learning/antidote-test-curriculum). The development workflow in this repository is pre-configured to expect that this curriculum repository exists as a sibling to this one, so please ensure both repositories are cloned to the same location. If you don't do this first, the rest of the workflow will not work.

Next, the following command will spin up the lightweight antidote stack:

```
make hack
```

This will start serving `antidote-web` at [http://127.0.0.1:8080/](http://127.0.0.1:8080/). However, as mentioned previously, this is not a fully functional Antidote instance, as the entire scheduling service is explicitly disabled. So, to facilitate front-end development, you need to install the necessary state information into `antidote-core`.

Within the `hack/` directory, which is mapped to `/hack` within the `antidote-core` container, there are two JSON files you can install by running `antictl`. 

```
docker exec antidote-web_antidote-core_1 antictl livelesson create /hack/dev-livelessons.json
```

These are the JSON representations for the [protobuf definitions found here](https://github.com/nre-learning/antidote-core/blob/master/api/exp/definitions/). They are also just examples, and you are responsible for editing and deleting/recreating the state as needed to suit your purposes. Once your state is installed, you can refresh the page and the front-end will query the back-end for the state you've installed.

> **Important note** - "state" is just about anything that's not derived from the curriculum repository, which most things are. Anything with the prefix "live", as in `livelesson` or `livesession` is able to be set manually in this way. However, things like lessons and images are derived from the curriculum you're working with. If you're using the `antidote-test-curriculum` which is the default in this repository, then you'll want to make changes there if you want to change these elements.
