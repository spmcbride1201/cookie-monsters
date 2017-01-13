const db = require('../db');
const Review = require('../db/models/review');

module.exports = require('express').Router()
  .get('/', (req, res, next) =>
    Review.findAll()
    .then(reviews => res.json(reviews))
    .catch(next))
  .post('/', (req, res, next) =>
    Review.create(req.body)
    .then(review => res.status(201).json(review))
    .catch(next))
  .get('/:id', (req, res, next) =>
    Review.findById(req.params.id)
    .then(review => res.json(review))
    .catch(next))
