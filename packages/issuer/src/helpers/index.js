'use strict';

const coordinapeSchema = require('./coordinape.schema');
const githubSchema = require('./github.schema');
const poapSchema = require('./poap.schema');
const withTimeout = require('./withTimeout').withTimeout;

const knownDataTypes = [
  'apeprofiles',
  'githubs',
  'poaps',
]; // should be more general/reusable defined structered data instead

module.exports = { 
  knownDataTypes,
  coordinapeSchema,
  githubSchema,
  poapSchema,
  withTimeout
};
