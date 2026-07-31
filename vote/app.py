from flask import Flask, render_template, request, redirect
import redis
import os

app = Flask(__name__)

redis_host = os.environ.get("REDIS_HOST", "redis")
r = redis.Redis(host=redis_host, port=6379, decode_responses=True)

@app.route("/")
def index():
    return """
    <html>
    <head>
        <title>Voting App</title>
    </head>

    <body style="font-family:Arial;text-align:center;margin-top:100px;">

        <h1>Vote Your Favorite Pet</h1>

        <form action="/vote" method="POST">

            <button name="vote" value="Cats">🐱 Cats</button>

            <button name="vote" value="Dogs">🐶 Dogs</button>

        </form>

    </body>
    </html>
    """

@app.route("/vote", methods=["POST"])
def vote():

    vote = request.form["vote"]

    r.rpush("votes", vote)

    return redirect("/")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)