'use strict'

const joi = require('joi')
const config = require('../config.json')
const inputs = {items: config.items.transaction.inputs}

const items = joi.object().keys({
  hash: joi.object({}).meta({className: 'crypto-hash-object'}).required(),
  data: joi.object({}).meta({className: 'transaction-iou-data'}).required(),
  sigs: joi.object({}).meta({className: 'crypto-signature-object'}).required()
})

const schema = joi.array().items(items)
  .min(inputs.items.min).max(inputs.items.max)
  .description('transaction inputs (IOUs)')
  .options({stripUnknown: false})

module.exports = schema
