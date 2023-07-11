const JoiErrorMessages = {
	"any.required": "{{#label}} is required!!",
	"string.empty": "{{#label}} can't be empty!!",
	"string.min": "{{#label}} must have minimum {{#limit}} characters",
	'string.alphanum': '{{#label}} must only contain alpha-numeric characters',
	'string.base': '{{#label}} must be a string',
	'string.base64': '{{#label}} must be a valid base64 string',
	'string.creditCard': '{{#label}} must be a credit card',
	'string.dataUri': '{{#label}} must be a valid dataUri string',
	'string.domain': '{{#label}} must contain a valid domain name',
	'string.email': '{{#label}} must be a valid email',
	'string.empty': '{{#label}} is not allowed to be empty',
	'string.guid': '{{#label}} must be a valid GUID',
	'string.hex': '{{#label}} must only contain hexadecimal characters',
	'string.hexAlign': '{{#label}} hex decoded representation must be byte aligned',
	'string.hostname': '{{#label}} must be a valid hostname',
	'string.ip': '{{#label}} must be a valid ip address with a {{#cidr}} CIDR',
	'string.ipVersion': '{{#label}} must be a valid ip address of one of the following versions {{#version}} with a {{#cidr}} CIDR',
	'string.isoDate': '{{#label}} must be in iso format',
	'string.isoDuration': '{{#label}} must be a valid ISO 8601 duration',
	'string.length': '{{#label}} must be {{#limit}} characters long',
	'string.lowercase': '{{#label}} must only contain lowercase characters',
	'string.max': '{{#label}} length must be less than or equal to {{#limit}} characters long',
	'string.min': '{{#label}} must be at least {{#limit}} characters long',
	'string.normalize': '{{#label}} must be unicode normalized in the {{#form}} form',
	'string.token': '{{#label}} must only contain alpha-numeric and underscore characters',
	'string.pattern.base': '{{#label}} with value {:[.]} fails to match the required pattern: {{#regex}}',
	'string.pattern.name': '{{#label}} with value {:[.]} fails to match the {{#name}} pattern',
	'string.pattern.invert.base': '{{#label}} with value {:[.]} matches the inverted pattern: {{#regex}}',
	'string.pattern.invert.name': '{{#label}} with value {:[.]} matches the inverted {{#name}} pattern',
	'string.trim': '{{#label}} must not have leading or trailing whitespace',
	'string.uri': '{{#label}} must be a valid uri',
	'string.uriCustomScheme': '{{#label}} must be a valid uri with a scheme matching the {{#scheme}} pattern',
	'string.uriRelativeOnly': '{{#label}} must be a valid relative uri',
	'string.uppercase': '{{#label}} must only contain uppercase characters'
}

const JoiConfig = {
	abortEarly: false,
	stripUnknown: true,
}

const handleJoiErrorMessages = messages => {
	const data = messages.details.map(({ message, type, context }) => ({
		message: message.replaceAll('"', ''),
		key: context.key,
	}))
	return {
		message: data.map(({ message }) => message.replaceAll('"', '')).join(', '),
		data
	}
}

function dataValidationMiddleware({
	body = null,
	query = null,
	params = null,
} = {}) {

	if (body) {
		checkForValidJoiObject(body)
	}
	if (query) {
		checkForValidJoiObject(query)
	}
	if (params) {
		checkForValidJoiObject(params)
	}

	return (req, res, next) => {
		const errorResponse = {}
		let isError = false
		if (body) {
			const { error } = body.validate(req.body, JoiConfig)
			if (error) {
				isError = true
				errorResponse.body = handleJoiErrorMessages(error)
			}
		}

		if (query) {
			const { error } = query.validate(req.query, JoiConfig)
			if (error) {
				isError = true
				errorResponse.query = handleJoiErrorMessages(error)
			}
		}

		if (params) {
			if (body) {
				const { error } = params.validate(req.params, JoiConfig)
				if (error) {
					isError = true
					errorResponse.params = handleJoiErrorMessages(error)
				}
			}
		}

		if (isError) {
			return res.status(422).json(errorResponse)
		}

		return next()
	}
}

function checkForValidJoiObject(joiValidationObject, part) {
	if (!joiValidationObject || typeof joiValidationObject.validate !== 'function') {
		throw new Error(`Invalid joi validation object in ${part ? part : ''}`)
	} else {
		const start = 0;
		const end = joiValidationObject.$_terms.keys.length
		for (let i = start; i < end; i++) {
			joiValidationObject.$_terms.keys[i].schema.messages(JoiErrorMessages)
		}
	}
}

module.exports = {
	JoiErrorMessages,
	JoiConfig,
	handleJoiErrorMessages,
	dataValidationMiddleware
}