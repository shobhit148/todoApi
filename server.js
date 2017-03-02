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
//GET /todos?queryparameter
app.get('/todos', function (req, res){
	var queryparameter = req.query;
	var filterTodos = todos;

	if(queryparameter.hasOwnProperty('completed') && queryparameter.completed === 'true'){
		filterTodos = _.where(filterTodos, {completed:true})
	}else if(queryparameter.hasOwnProperty('completed') && queryparameter.completed === 'false'){
		filterTodos = _.where(filterTodos, {completed:false});
	}

	res.json(filterTodos);
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

//PUT /todos/:id
app.put('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id:todoId});		

	var body = _.pick(req.body, "description", "completed");
	var validAttribures = {};

	if(!matchedTodo){
		return res.status(404).send();
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttribures.completed = body.completed;
	}else if(body.hasOwnProperty){
		return res.status(400).send();
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length>0){
		validAttribures.description = body.description;
	}else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}

	//here we will use extend to copy into another one
	_.extend(matchedTodo, validAttribures);
	res.json(matchedTodo);

});

app.listen (PORT, function(){
	console.log('Express listeing on port '+ PORT);
}); 