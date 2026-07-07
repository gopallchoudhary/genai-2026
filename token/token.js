import {get_encoding} from 'tiktoken'

const encodingForGPT2 = get_encoding('gpt2')

const encoded = encodingForGPT2.encode('Hello, I am Gopal Choudhary')

console.log(encoded)

const decoded = encodingForGPT2.decode(encoded)
console.log(new TextDecoder().decode(decoded))