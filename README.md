# SAGAMATRON

[![npm](https://img.shields.io/npm/v/sagamatron.svg)](https://www.npmjs.com/package/sagamatron)

Take the boilerplate out of your React/Redux/Saga stack using the magic of TypeScript! 🧙

![SAGAMATRON converting side effects into happiness](https://raw.githubusercontent.com/agiledigital/sagamatron/master/docs/logo.png "SAGAMATRON Logo")

## Summary

A project to reduce the amount of boilerplate
that needs to be written for redux/redux-saga
based applications.

Developed for an Agile Digital "Fedex Day".

## Motivation

Here at Agile Digital we are big on using
[Redux](https://github.com/reduxjs/redux) and
[Sagas](https://github.com/redux-saga/redux-saga)
to manage state and side effects.

However, the benefits of redux-saga come with a downside.
There is a lot of boilerplate code that needs to be written
to support the patterns enforced by redux and redux-saga.

This can discourage developers from using these patterns,
and can sometimes make simple features to take extra time to implement.

In newer versions of React, new forms of state management
have been introduced in the form of hooks.
While they have their rightful place in a React application,
for example when managing temporary UI state,
their simplicity can tempt developers to manage more and more
of the application's state using them.
Initially this trade off might seem successful due to faster
cycle times and a perceived reduction in complexity
but their are hidden costs that will appear later in
the lifecycle of a project.

To try and avoid this trend, we decided to use the power
of TypeScript to reduce the boilerplate of redux and redux-saga.

![BEWARE THE HOOKS](https://i.imgur.com/D01096N.png "BEWARE THE HOOKS")

## Example

We are still working on the types but expect this to be updated by the end of the day with some concrete examples. 🤗
