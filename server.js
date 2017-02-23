var express = require('express');

var app = express();

var PORT = process.env.PORT || 3000;

var todos = [{
	id:1,
	descroption: 'Meet mom for lunch',
	completed:false
},{
	id:2,
	descroption:'Go to market',
	completed:false
},{
	id:3,
	descroption:'Show all data',
	completed:true
}];

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
	var matchedTodo;

	todos.forEach(function (todo){
		if(todoId === todo.id){
			matchedTodo = todo;
		}
	});

	if(matchedTodo){
		res.json(matchedTodo)
	}else{
		res.status(404).send();
	}
});

app.listen (PORT, function(){
	console.log('Express listeing on port');
});