const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customers
describe('Testing tableDAO.find method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync()
    await purposize.loadPurposes('./purposes.yml')
    
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })

    const bob = await Customers.create({
      eMail: "bob@email.com",
      postalAddress: "1234 Buytown",
      unfulfilledOrders: 2
    }, {
      purpose: ['ORDER', 'NEWSLETTER']
    })
  })

  it('Success for no purpose, no where and no select fields', async () => {
    const result = await Customers.find({})
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
  })

  it('Error for no purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customers.find({ 
        where: {
          eMail: "bob@email.com"
        }
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error for no purpose, no where fields, sensitive select fields', async () => {
    try {
      const result = await Customers.find({ 
        attributes: ["eMail"]
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error for unknown purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customers.find({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'TEST'
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error for invalid purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customers.find({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: true
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Success for no purpose, unsensitive where fields, no select fields', async () => {
    const result = await Customers.find({ 
      where: {
        unfulfilledOrders: 2
      }
    })
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).to.be.equal(2)
  })

  it('Success for no purpose, no where fields, sensitive select fields', async () => {
    const result = await Customers.find({ 
      attributes: ["unfulfilledOrders"]
    })
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
  })

  it('Success for purpose, unsensitive where fields, no select fields', async () => {
    const result = await Customers.find({ 
      where: {
        eMail: "bob@email.com",
      },
      purpose: 'ORDER'
    })
    expect(result.eMail).not.to.be.undefined
    expect(result.postalAddress).not.to.be.undefined
    expect(result.unfulfilledOrders).to.be.equal(2)
  })

  it('Success for purpose, unsensitive where fields, sensitive select fields', async () => {
    const result = await Customers.find({ 
      attributes: ["eMail"],
      where: {
        eMail: "bob@email.com",
      },
      purpose: 'ORDER'
    })
    expect(result.eMail).not.to.be.undefined
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).to.be.undefined
  })

  it('Error for purpose with illegal where fields', async () => {
    try {
      const result = await Customers.find({ 
        where: {
          postalAddress: "1234 Buytown"
        },
        purpose: 'NEWSLETTER'
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error for purpose with illegal select fields', async () => {
    try {
      const result = await Customers.find({ 
        attributes: ["postalAddress"],
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'NEWSLETTER'
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Success for purpose with limited fields', async () => {
    const result = await Customers.find({
      where: {
        eMail: "bob@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).not.to.be.undefined
  })

})
