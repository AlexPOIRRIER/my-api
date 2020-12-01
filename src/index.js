const express = require("express");
const connection = require("./config");

const port = process.env.PORT;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is runing on 3000`);
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

app.get("/", (req, res) => {
  res.send("Welcome to my video-games api");
});

app.get("/api/games", (req, res) => {
  connection.query(
    "SELECT * FROM games",
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    });
});

app.get("/api/games/:title", (req, res) => {
  connection.query(
    "SELECT * FROM games WHERE title=?",
    [req.params.title],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else if (results[0] === undefined) {
        res.status(404).send("Game not found")
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/filter", (req, res) => {
  connection.query(
    `SELECT * FROM games WHERE title LIKE '${req.query.start}%'`,
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else if (results[0] === undefined) {
        res.status(404).send("Game not found")
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/having", (req, res) => {
  connection.query(
    `SELECT * FROM games WHERE title LIKE '%${req.query.contain}%'`,
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else if (results[0] === undefined) {
        res.status(404).send("Game not found")
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/search", (req, res)=> {
  connection.query(
    "SELECT * FROM games WHERE rating >= ?",
    [req.query.rate],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        if (results.length > 0) {
          res.status(200).json(results);
        } else {
          res.status(404).send("No games found");
        }
      }
    }
  )
})

app.get("/api/ordered", (req, res) => {
  connection.query(
    `SELECT * FROM games ORDER BY release_date ${req.query.order}`,
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    });
});

app.post("/api/games", (req, res) => {
  const { title, description, release_date, rating } = req.body;
  connection.query(
    "INSERT INTO games(title, description, release_date, rating) VALUES(?, ?, ?, ?)",
    [title, description, release_date, rating],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving game");
      } else {
        res.status(200).send("Game added succesfully");
      }
    }
  )
});

app.put("/api/games/:id", (req, res) => {
  const idGame = req.params.id;
  const newGame = req.body;
  connection.query(
    "UPDATE games SET ? WHERE id = ?",
    [idGame, newGame],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a game");
      } else {
        res.status(200).send("Game updated successfully");
      }
    }
  );
});

app.put("/api/:id/toggle", (req, res) => {
  const idGame = req.params.id;
  const newBool = req.body;
  connection.query(
    "UPDATE games SET r_rated = NOT r_rated",
    [idGame, newBool],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a game");
      } else {
        res.status(200).send("Game updated successfully");
      }
    }
  );
});

app.delete("/api/games/:id", (req, res) => {
  const idGame = req.params.id;
  connection.query(
    "DELETE FROM games WHERE id = ?",
    [idGame],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting an game");
      } else {
        res.status(200).send("Game deleted!");
      }
    }
  );
});

app.delete("/api/games/false", (req, res) => {
  connection.query(
    "DELETE FROM games WHERE r_rated = 0",
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting games");
      } else {
        res.status(200).send("Game deleted!");
      }
    }
  );
});

