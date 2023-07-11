const express = require('express')
const joi = require('joi')
const { dataValidationMiddleware } = require('./joi_helper')

const app = express()

app.use(express.json())

const users = []

const _LoginSchema = {
	username: joi.string().min(6).required(),
	password: joi.string().min(6).required(),
}
const LoginSchema = joi.object(_LoginSchema)

const SignupSchema = joi.object({
	fullName: joi.string().min(6).required(),
	..._LoginSchema
})

const signupQuerySchema = joi.object({
	platform: joi.string().valid('web', 'mobile').required(),
})

app.post('/login', dataValidationMiddleware({ body: LoginSchema }), (req, res) => {

	const user = users.find(user => user.username === req.body.username)
	if (!user) {
		return res.status(400).send('Username or password is wrong')
	}
	if (user.password !== req.body.password) {
		return res.status(400).send('Username or password is wrong')
	}
	res.send('Login success')
})

app.post('/signup', dataValidationMiddleware({ body: SignupSchema, query: signupQuerySchema }), (req, res) => {

	const { error } = schema.validate(req.body)
	if (error) {
		return res.status(400).send(error.details[0].message)
	}

	const user = users.find(user => user.username === req.body.username)
	if (user) {
		return res.status(400).send('Username already exists')
	}

	users.push(req.body)
	res.send('Signup success')


})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})