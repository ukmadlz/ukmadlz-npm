#!/usr/bin/env node

const package = require('./package.json');

const API_URL = 'http://elsmore.me/api/socials';

fetch(API_URL)
.then((res) => res.json())
.then((data) => {
    const theMeBit = `
    Mike Elsmore works for Infobip as a Senior Developer Advocate.

    For a day job he's usually talking about stuff, building stuff (occasionally SDKs), and trying share stuff.
    
    Mike hacks and speaks about topics such as ${package.keywords.join(', ')}.
    
    E-mail: <mike@elsmore.me>
    Website: <https://elsmore.me>
    Work E-mail: <mike.elsmore@infobip.com>
${data.data.map(d => `    ${d.name}: <${d.link}>`).join('\n')}
    `
    console.log(theMeBit)
})
