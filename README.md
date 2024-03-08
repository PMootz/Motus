# Projet Microservices
Création d'une application web en utilisant une architecture Microservices.

Ce projet a été réalisé par Philippe Mootz, Duncan Boukhssibi et Marion Pinoit.

## Projet

Le projet consiste a réaliser un jeu de Motus, où l'on peut trouver le mot du jour en 5 essais.
Si le mot est trouvé, le score du joueur va augmenter et le nombre d'essais va être sauvegarder.
Le joueur peut s'identifier à chaque fois qu'il commence à jouer.
Lorsque le joueur se rend sur la page des scores, il peut y voir son score total et sa moyenne du nombre d'essais.

## Etat

Ce qui fonctionne :

- Le jeu du Motus ainsi que le calcul des scores
- L'authentification pour la création d'un users

For now the game and scoring work.
There is an issue with the authentification and more precisely the session storage, we use redis but we have problem.
But we can create an user and authentificate as we want
If this part is solved we will attache the score to the connected user and display it.
We have the docker file for each part of the program, it work for now but I didn't add the redis part so it won't work. The docker-compose is also there.

The happroxy is in progress.
For now we use json to store the score and the user. But we want to store it in redis

## Fonctionement du projet

Télécharger le code sur le gitHub
Ouvrir un terminal et aller sur le dossier correspondant
Entrer la commande suivante :
## Diagrams

```mermaid
sequenceDiagram
actor User
    User->>+PC: conexion
    PC->>+Page: 
    Page->>Page : user
    Page->>+Auth: redirect
    User->>Auth: authentifier
    Auth->>-Page: uri
    Page->>+Auth : token
    Auth->>-Page: new User
    Page->>-PC : authentifier
```


```mermaid
sequenceDiagram
actor User
User->>+PC : Motus
    PC->>+Page : Motus
    Page->>+Motus : nb Word
    Motus->>-Page : nb Word
    Page->>-PC : afficher Motus
    User->>+PC : entrer valeur
    PC->>+Page : entrer valeur
    loop while false
        Page->>+Motus : check
        Motus->>-Page : check
        Page->>+Score : SetScore
        Score->>Score : save
        Score-->>-Page : res
    end
    Page->>-PC : Jeu terminé
```

 ```mermaid
sequenceDiagram
actor User
    User->>+PC : voir Score
    PC->>+Page : voir Score 
    Page->>+Score : GetScore
    Score->>-Page : res
    Page->>-PC : Afficher Score
```


```mermaid
flowchart LR
    A(User) -->B(Page)
    B(Page) --->C(Motus)
    C(Motus) -->B(Page)
    B(Page) --->D(Auth)
    D(Auth) -->B(Page)
    B(Page) --->E(Score)
    E(Score) --->B(Page)
    A(User) -->D(Auth)
```

## Prochaines étapes

Modifier le jeu motus afin d'interdire une combinaison de lettres ne formant pas un mot français d'être testé par le programme.
