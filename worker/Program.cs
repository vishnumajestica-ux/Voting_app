using Npgsql;
using StackExchange.Redis;

Console.WriteLine("Worker Started...");

var redis = ConnectionMultiplexer.Connect("redis:6379");
var dbRedis = redis.GetDatabase();

string conn =
"Host=db;Port=5432;Username=postgres;Password=postgres;Database=votesdb";

while(true)
{
    var vote = dbRedis.ListLeftPop("votes");

    if(vote.HasValue)
    {
        using var connection = new NpgsqlConnection(conn);

        connection.Open();

        var sql = "INSERT INTO votes(vote) VALUES(@vote)";

        using var cmd = new NpgsqlCommand(sql, connection);

        cmd.Parameters.AddWithValue("vote", vote.ToString());

        cmd.ExecuteNonQuery();

        Console.WriteLine($"Saved : {vote}");
    }

    Thread.Sleep(1000);
}