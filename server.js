var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _=require('underscore');
var db = require('./db.js');

var bcrypt = require('bcrypt');

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
	//var queryparameter = req.query;
	//var filterTodos = todos;

	var query = req.query;
	var where = {};

	if(query.hasOwnProperty('completed') && query.completed == 'true'){
		where.completed = true;
	}else if(query.hasOwnProperty('completed') && query.completed == 'false'){
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length>0){
		where.description = {
			$like : '%' + query.q + '%'
		};
	}

	db.todo.findAll({where:where}).then(function (todos){
		res.json(todos);
	}, function (e){
		res.status(500).send();
	})

/*
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

	res.json(filterTodos);*/
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

	db.todo.destroy({
		where:{
			id:todoId
		}
	}).then(function (rowDeleted){
		if(rowDeleted ===0){
			res.status(404).json({
				error:'No todo with this id'
			});
		}else{
			res.status(204).send();
		}
	},function(){
		res.status(500).send();
	});
	/*var matchedTodo = _.findWhere(todos, {id:todoId});		

	if(!matchedTodo){
		res.status(404).json({"error": "no todo find with that id"});
	}else{
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}*/
})

//PUT /todos/:id
app.put('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	//var matchedTodo = _.findWhere(todos, {id:todoId});		

	var body = _.pick(req.body, "description", "completed");
	var attribures = {};
 
	/*if(!matchedTodo){
		return res.status(404).send();
	}*/

	if(body.hasOwnProperty('completed')){
		attribures.completed = body.completed;
	}

	if(body.hasOwnProperty('description')){
		attribures.description = body.description;
	}

	db.todo.findById(todoId).then(function (todo){
		if(todo){
			todo.update(attribures).then(function(todo){
				res.json(todo.toJSON());
			},function(e){
				res.status(400).json(e);
			})
		}else{
			res.status(404).send();
		}
	}, function(){
		req.status(500).send();
	});

});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

//POST /users/login/
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function(){
		res.status(401).send();
	});
});

db.sequelize.sync().then(function(){
	app.listen (PORT, function(){
		console.log('Express listeing on port '+ PORT);
	});
});

 