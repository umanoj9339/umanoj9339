const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () =>
      console.log("Server Running at http://localhost:3001/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const ConvertDbToObject = (item) => {
  return {
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    category: item.category,
    status: item.status,
    dueDate: format(new Date(item.due_date), "yyyy-MM-dd"),
  };
};

//format(new Date(item.dueDate), "MM/dd/yyyy")

//Q1 get

const StatusTodo = (doQuery) => {
  return doQuery.status !== undefined;
};
const PriorityTodo = (doQuery) => {
  return doQuery.priority !== undefined;
};

const priorityAndStatus = (doQuery) => {
  return doQuery.status !== undefined && doQuery.priority !== undefined;
};

const SearchIsBuy = (doQuery) => {
  return doQuery.todo !== undefined;
};

const CategoryAndStatusDone = (doQuery) => {
  return doQuery.category !== undefined && doQuery.status !== undefined;
};

const CategoryIsHome = (doQuery) => {
  return doQuery.category !== undefined;
};

const CAtegoryAndPri = (doQuery) => {
  return doQuery.category !== undefined && doQuery.priority !== priority;
};

app.get("/todos/", async (request, response) => {
  const getQuery = `
    SELECT
      *
    FROM
      todo;`;

  const {
    search_q = "",
    priority,
    status,
    category,
    todo,
    dueDate,
  } = request.query;
  let getTodosQuery = "";
  let data = "";
  //   response.send(Array.map((each) => ConvertDbToObject(each)));
  switch (true) {
    case priorityAndStatus(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE
            priority = "HIGH" 
            AND status = "IN PROGRESS";`;
      break;
    case StatusTodo(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        status = '${status}';`;
      break;

    case PriorityTodo(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE priority = '${priority}';`;
      break;

    case SearchIsBuy(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
        todo LIKE '%${search_q}%';`;
      break;
    case CategoryAndStatusDone(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
        category = '${category}'
        AND status = '${status}';`;
      break;
    case CategoryIsHome(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
        category = '${category}';`;
      break;
    case CAtegoryAndPri(request.query):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
        category = '${category}'
        AND priority = '${priority}';`;
      break;
    default:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
        todo LIKE '%${search_q}%';`;
      break;
  }
  data = await database.all(getTodosQuery);
  response.send(data.map((everyItem) => ConvertDbToObject(everyItem)));
});

//Q2 /todos/:todoId/

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosQuery = `
    SELECT *
    FROM todo
    WHERE id = '${todoId}';`;
  const data = await database.get(getTodosQuery);
  response.send(data);
});

//Q3 /agenda/

const ConvertDbToObjecT = (item) => {
  return {
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    category: item.category,
    status: item.status,
    date: format(new Date(item.due_date), "yyyy-MM-dd"),
  };
};

app.get("/agenda/", async (request, response) => {
  const { dueDate } = request.query;
  const getTodosQuery = `
    SELECT id,todo,category,priority,status,dueDate
    FROM agenda
    WHERE dueDate = "2021-02-22";`;
  const data = await database.get(getTodosQuery);
  response.send([data]);
});

//Q4 POST

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, category, status, due_date } = request.body;
  const InsertNewTodo = `
    INSERT INTO todo (id,todo,priority,category,status,due_date)
    VALUES ('${id}','${todo}','${priority}','${category}','${status}','${due_date}');`;

  await database.run(InsertNewTodo);
  response.send("Todo Successfully Added");
});

//Q5 PUT

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateCOlumn = null;
  const requestBody = request.body;

  switch (true) {
    case requestBody.todo !== undefined:
      updateCOlumn = "Todo";
      break;
    case requestBody.priority !== undefined:
      updateCOlumn = "Priority";
      break;
    case requestBody.category !== undefined:
      updateCOlumn = "Category";
      break;
    case requestBody.status !== undefined:
      updateCOlumn = "Status";
      break;
    case requestBody.dueDate !== undefined:
      updateCOlumn = "dueDate";
      break;
    default:
      updateCOlumn = "NONE";
      break;
  }

  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateCOlumn} Updated`);
});

//Q6 DE/todos/:todoId/
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE 
    FROM
    todo
    WHERE id = '${todoId}';`;

  await database.run(deleteTodo);
  console.log("Todo Deleted");
});
module.exports = app;
