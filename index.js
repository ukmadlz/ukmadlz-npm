#!/usr/bin/env node

const package = require("./package.json");

const API_URL = "http://elsmore.me/api/socials";

fetch(API_URL)
  .then((res) => res.json())
  .then((data) => {
    const theMeBit = `
    Mike Elsmore is available for hire for software development, MVPs, Developer Experience and Developer Relations related work.

    For a day job he's usually talking about stuff, building stuff (occasionally SDKs), and trying share stuff.

    Mike hacks and speaks about topics such as ${package.keywords.join(", ")}.

    E-mail: <mike@elsmore.me>
    Website: <https://elsmore.me>
${data.data.map((d) => `    ${d.name}: <${d.link}>`).join("\n")}
    `;
    console.log(theMeBit);
  });
