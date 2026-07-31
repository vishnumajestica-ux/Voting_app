const express = require("express");
const { Client } = require("pg");

const app = express();

const client = new Client({
    host: "db",
    user: "postgres",
    password: "postgres",
    database: "votesdb",
    port: 5432
});

client.connect();

app.get("/", async (req, res) => {

    const result = await client.query(
        "SELECT vote, COUNT(*) total FROM votes GROUP BY vote"
    );

    let html = `
    <html>

    <head>

    <title>Voting Result</title>

    </head>

    <body style="font-family:Arial;text-align:center;">

    <h1>Voting Results</h1>

    <table border="1" align="center">

    <tr>

    <th>Option</th>

    <th>Votes</th>

    </tr>
    `;

    result.rows.forEach(row=>{

        html += `
        <tr>

        <td>${row.vote}</td>

        <td>${row.total}</td>

        </tr>
        `;
    });

    html += "</table></body></html>";

    res.send(html);

});

app.listen(5001, ()=>{

    console.log("Result App Running");

});