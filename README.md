# HomeProjectServer

Pre-requis: 
Nodejs

Installation:
npm install socket.io

Lancement:
node server.js

https://github.com/microsoft/TypeScript/issues/6751

module.exports = Object.freeze({
  ACTION_INVALID: 'This action is invalid',
  ACTION_VALID: 'Some other action',
});
Then you can import it

import ConstantsList from './constants';
and use

console.log(ConstantsList.ACTION_INVALID)
-----------------------------------------------
export const ACTION_INVALID = "This action is invalid!"
export const CONSTANT_NUMBER_1 = 'hello I am a constant';
export const CONSTANT_NUMBER_2 = 'hello I am also a constant';
fileThatUsesConstants.js:

import * as myConstClass from 'path/to/fileWithConstants';

const errorMsg = myConstClass.ACTION_INVALID;
-------------------------
https://stackoverflow.com/questions/19156636/node-js-and-socket-io-creating-room