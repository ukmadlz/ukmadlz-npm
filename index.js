#!/usr/bin/env node

const package = require('./package.json');

const theMeBit = `
Mike Elsmore works for Infosum as a Lead Developer Advocate.

Mike hacks and speaks about topics such as ${package.keywords.join(', ')}.

E-mail: <mike@elsmore.me>
Website: <https://elsmore.me>
Work E-mail: <mike.elsmore@infosum.com>
Twitch: <https://twitch.tv/ukmadlz>
Twitter: <https://twitter.com/ukmadlz>
GitHub: <https://www.github.com/ukmadlz>
LinkedIn: <https://uk.linkedin.com/in/mikeelsmore>
`
console.log(theMeBit)
