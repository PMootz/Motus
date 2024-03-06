# Motus
Creation of a Motus game website with microservice

This project has been made with Philippe Mootz, Duncan Boukhssbi et Marion Pinoit.

## Project 

The project is a game of Motus, where you must find the word of the day with 5 try.
If the word is find, your score will increase and your number of try saved.
When you go to the score page, it will show your total score and the average number of try.

## State

For now the game and scoring par work.
There is an issue with the authentificationand more precisely the session storage, we use redis but we have problem.
But we can create an user and authentificate as we want
If this part is solved we will attache the score to the connected user and display it.
We have the docker file for each part of the program, it work for now but I didn't add the redis part so it won't work. The docker-compose is also there.

The happroxy is in progress.
For now we use json to store the score and the user. But we want to store it in redis
