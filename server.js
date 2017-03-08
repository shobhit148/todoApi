var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _=require('underscore');
var db = require('./db.js');

var PORT = process.env.PORT || 3000;

var todos = [];

var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root!');
});

//http://localhost:3000/todos/3
//GET /todos?completed=true&q=work
app.get('/todos', function (req, res){
	var queryparameter = req.query;
	var filterTodos = todos;

	if(queryparameter.hasOwnProperty('completed') && queryparameter.completed === 'true'){
		filterTodos = _.where(filterTodos, {completed:true})
	}else if(queryparameter.hasOwnProperty('completed') && queryparameter.completed === 'false'){
		filterTodos = _.where(filterTodos, {completed:false});
	}

	if(queryparameter.hasOwnProperty('q') && queryparameter.q.length>0){
		filterTodos =_.filter(filterTodos, function (todo){
			return todo.description.toLowerCase().indexOf(queryparameter.q.toLowerCase()) > -1;
		});	
	}

	res.json(filterTodos);
});

//GET /todos/:id
app.get('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo){
		if(!!todo){
			res.json(todo.toJSON());
		}else{
			res.status(404).send();	
		}
	}, function(e){
		res.status(500).send();
	});
});

//POST /todos:id
app.post('/todos', function (req, res){
	//var body = req.body;
	var body = _.pick(req.body, "description", "completed");

	db.todo.create(body).then(function (todo){
		res.json(todo.toJSON());
	}, function (e){
		res.status(400).json(e);
	});
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

db.sequelize.sync().then(function(){
	app.listen (PORT, function(){
		console.log('Express listeing on port '+ PORT);
	});
});

 