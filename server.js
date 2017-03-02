var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _=require('underscore');

var PORT = process.env.PORT || 3000;

var todos = [];

var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root!');
});

//http://localhost:3000/todos/3
//GET /todos
app.get('/todos', function (req, res){
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	
	if(matchedTodo){
		res.json(matchedTodo)
	}else{
		res.status(404).send();
	}
});

//POST /todos:id
app.post('/todos', function (req, res){
	//var body = req.body;
	var body = _.pick(req.body, "description", "completed");

	//use _.pick to pick only description and completed

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send(); 
	}

	body.description = body.description.trim();
	//set body.description as trimmed value

	//add field to body
	body.id = todoNextId++;

	//push body
	todos.push(body);

	//console.log('description ' + body.description);
	res.json(body);
});


	//DELETE /todo/id
	app.delete('/todos/:id', function (req, res){
		var todoId = parseInt(req.params.id, 10);
		var matchedTodo = _.findWhere(todos, {id:todoId});		

		if(!matchedTodo){
			res.status(404).json({"error": "no todo find with that id"});
		}else{
			todos = _.without(todos, matchedTodo);
			res.json(matchedTodo);
		}
	})


app.listen (PORT, function(){
	console.log('Express listeing on port '+ PORT);
}); 