'use strict'

const utils = require('@lib/utils')

async function setup(req, res, next) {
  try { 
    let inputs = req.body.data.inputs
    /* 0. Verify transaction integrity */
    await utils.iou.verifyCryptoIntegrity(inputs)

    /* 1. Extract wallet properties from input sources and targets */
    let {wallets, countspaces} = utils.iou.parseWalletProperties(inputs)
    /* 2. Get public keys for signature verification, if applicable */
    await utils.iou.findCryptoPublicKeys(inputs, wallets)
    /* 3. Verify digital signatures of all IOUs */
    let verification = await utils.iou.verifyCryptoSignatures(inputs, wallets)
    
    let outputs = utils.transaction.buildOutputsMapping(wallets)
    res.locals.countspaces = countspaces
    res.locals.wallets = wallets
    res.locals.newoutputs = outputs
    
    next()
  } catch(exception) {
    let {message, details, stack} = exception
    let body = {error: {message, details}}
    let status = 400
  
    switch (exception.message) {
    case 'signature-verification-failed':
      break
    default:
      status = 500
      break
    }
  
    res.send(body).sendStatus(status)
  }

}

async function handler(req,res) {
  let transaction = res.locals.transaction
  let graphTransaction = res.locals.graphTransaction
  let records = res.locals.records


  let validation = await utils.transaction.preCommitValidation(transaction, records)
  await utils.transaction.commitORRollback(validation, graphTransaction)

  res.send(validation.response)
}


module.exports = { setup, handler }
