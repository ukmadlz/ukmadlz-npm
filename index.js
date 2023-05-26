#!/usr/bin/env node

const package = require('./package.json');

const API_URL = 'http://elsmore.me/api/socials';

fetch(API_URL)
.then((res) => res.json())
.then((data) => {
    const theMeBit = `
    Mike Elsmore works for Infosum as a Lead Developer Advocate.
    
    Mike hacks and speaks about topics such as ${package.keywords.join(', ')}.
    
    E-mail: <mike@elsmore.me>
    Website: <https://elsmore.me>
    Work E-mail: <mike.elsmore@infosum.com>
${data.data.map(d => `    ${d.name}: <${d.link}>`).join('\n')}
    `
    console.log(theMeBit)
})
