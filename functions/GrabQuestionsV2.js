const faunadb = require('faunadb'),
q = faunadb.query;
const Client = new faunadb.Client({ secret: 'fnAEN56_MwACQKzzE9wDEAAY4w5EUN7nNnstIyAN' })
var Output = "JSON Did not Attach"

exports.handler = (event, context, callback) => {
    console.log(event.body)
	Client.query(
		q.Paginate(
			q.Match(
				q.Index('GrabAllQuestionsV3')),
				{size: 5000}
		)
	)
	.then(function(result){
		if(result == "" | undefined){
			console.log("No Result")
		}
		console.log(result)
		console.log(result.data)
		return callback(null, {
			statusCode: 200,
			body: `${JSON.stringify(result.data)}`
		  })
	})
  }
