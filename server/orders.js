'use strict'

const db = require('../db')
const Order = require('../db/models/order')
const Product = require('../db/models/product')
const Promise = require('bluebird');

module.exports = require('express').Router()

	// Retrieve all orders, including products and orderlineitem details
	.get('/', (req, res, next) =>
		Order.findAll({
			include: [{
				model: Product,
				through: {
					attributes: ['quantity', 'price']
				}
			}]
		})
			// TODO : Clean up this nightmare somehow
			.then((orders) => orders.map(
				({
					orderID,
					status,
					shippingRate,
					shippingCarrier,
					trackingNumber,
					created_at,
					products,
					total}) => Promise.props({
						orderID,
						status,
						shippingRate,
						shippingCarrier,
						trackingNumber,
						created_at,
						products,
						total
					})))
			.then(orders => Promise.all(orders))
			.then(orders => res.json(orders))
			.catch(next)
	)


	// Create a new empty order without products
	// The request body may contain status, shippingRate, shippingCarrier, or trackingNumber
	// TODO: Enhance to be able to create items at the same time once
	// This should be done when the Redux store structure is better understood


	// {
	// 	"status": "cancelled",
	//   "shippingRate": 9.99,
	//   "shippingCarrier": null,
	//   "trackingNumber": null,
	// 	"orderLineItems": {
	// 		"2": { "quantity": 10 },
	// 		"10": { "quantity": 2 }
	// 	}
	// }

	.post('/', (req, res, next) =>
		Order.create(req.body)
			.then(order => res.json(order))
			.catch(next))

	// This is just a starting point for pair programming with Eliot tomorrow
	// .post('/', (req, res, next) =>
	// 	Order.create(req.body, {
	// 		include: [{
	// 			model: Product,
	// 			through: {
	// 				attributes: ['quantity', 'price']
	// 			}
	// 		}]
	// 	})
	// 		.then((order) => { })
	// 		.then(order => res.json(order))
	// 		.catch(next))

	// Retrieve a single order, including products and orderlineitem details
	.get('/:orderId', (req, res, next) => {
		let idAsNumber = parseInt(req.params.orderId, 10);
		if (!isNaN(idAsNumber)) {
			Order.findById(idAsNumber, {
				include: [{
					model: Product,
					through: {
						attributes: ['quantity', 'price']
					}
				}]
				// TODO : Clean up this nightmare somehow
			}).then(({
				orderID,
				status,
				shippingRate,
				shippingCarrier,
				trackingNumber,
				created_at,
				products,
				total}) => Promise.props({
					orderID,
					status,
					shippingRate,
					shippingCarrier,
					trackingNumber,
					created_at,
					products,
					total
				}))
				.then((order) => res.json(order))
				.catch(next)
		} else {
			res.sendStatus(400)
		}
	})

	// Update an order
	// {"orderLineItems": {
	// 	"2": {"quantity": 10},
	//  	"10": {"quantity": 2}
	// }}
	.put('/:orderId', (req, res, next) => {
		Order.findById(req.params.orderId)
			.then((order) => order.update(req.body))
			.then((order) => res.status(200).json(order))
			.catch(next)
	})

	// Delete an order
	.delete('/:orderId/', (req, res, next) =>
		Order.findById(parseInt(req.params.orderId, 10))
			.then((order) => order.destroy())
			.then(res.sendStatus(200))
			.catch(next))


	// Move product ID and quantity to req.body
	// Add several items to an order or update the item count in an order

	// {"orderLineItems": {
	// 	"2": {"quantity": 10},
	//  	"10": {"quantity": 2}
	// }}

	.post('/:orderId/products/', (req, res, next) => {
		let orderLineItems = req.body.orderLineItems;
		let productIds = Object.keys(orderLineItems);
		let order;
		Order.findById(parseInt(req.params.orderId, 10))
			.then((_order) => {
				order = _order;
				return Promise.all(productIds.map((productId) => Product.findById(productId)))
			})
			.then((products) => {
				products.forEach((product) =>
					order.addProduct(product, {
						quantity: orderLineItems[product.id].quantity,
						price: product.price
					})
				)
			})
			.then(res.sendStatus(200))
			.catch(next)
	})

	// Remove an item from an order
	.delete('/:orderId/products/:productId', (req, res, next) => {
		Order.findById(req.params.orderId)
			.then((order) => {
				return order.removeProduct(req.params.productId);
			})
			.then(res.sendStatus(200))
			.catch(next)
	})