#!/bin/bash

URL="http://localhost:80/api/movies"

# Avatar: Fire and Ash
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Avatar: Fire and Ash",
  "director": "James Cameron",
  "synopsis": "Jake Sully y Neytiri enfrentan una nueva amenaza en Pandora mientras surgen conflictos entre diferentes clanes Na’vi.",
  "genres": "sci_fi,aventura,accion",
  "duration_minutes": 192,
  "classification": "B",
  "release_date": "2025-12-19",
  "poster_url": "https://media.themoviedb.org/t/p/w600_and_h900_face/vHtH4xdcTbaCVftGwaeGFHfOB3p.jpg",
  "trailer_url": "nb_fFj_0rq8"
}'

echo "Avatar: Fire and Ash enviado"

# BACKROOMS
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "BACKROOMS",
  "director": "Kane Parsons",
  "synopsis": "Un joven queda atrapado en un inquietante laberinto de habitaciones infinitas conocido como los Backrooms.",
  "genres": "terror,misterio,sci_fi",
  "duration_minutes": 100,
  "classification": "B15",
  "release_date": "2026-01-01",
  "poster_url": "https://image.tmdb.org/t/p/w1280/w8nrM9hCTxoeX96HmTQpC0HbkMY.jpg",
  "trailer_url": "j6xBUJSm_S8"
}'

echo "BACKROOMS enviado"

# Wildwood
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Wildwood",
  "director": "Travis Knight",
  "synopsis": "Prue McKeel y su amigo Curtis se adentran en un bosque mágico y peligroso para rescatar al hermano menor de Prue después de que es secuestrado por cuervos.",
  "genres": "animada,fantasia,aventura",
  "duration_minutes": 110,
  "classification": "A",
  "release_date": "2026-10-23",
  "poster_url": "https://image.tmdb.org/t/p/original/dSjy8wUsHamYlkVdda2Spj5axhl.jpg",
  "trailer_url": "POneS8h1jyU"
}'

echo "Wildwood enviado"

# Dune: Parte 3
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Dune: Parte 3",
  "director": "Denis Villeneuve",
  "synopsis": "Paul Atreides enfrenta las consecuencias de su ascenso mientras el imperio entra en una nueva etapa de conflicto y fanatismo.",
  "genres": "sci_fi,aventura,drama",
  "duration_minutes": 170,
  "classification": "B15",
  "release_date": "2026-12-18",
  "poster_url": "https://tse4.mm.bing.net/th/id/OIP.rL2ypfNIwegxbQoRJA9sKgHaJ4?cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3",
  "trailer_url": "3_9vCamtuPY"
}'

echo "Dune: Parte 3 enviado"

# Spider-Man: Brand New Day
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Spider-Man: Brand New Day",
  "director": "Destin Daniel Cretton",
  "synopsis": "Peter Parker intenta reconstruir su vida mientras enfrenta nuevas amenazas tras los eventos que cambiaron su identidad para siempre.",
  "genres": "accion,aventura,sci_fi",
  "duration_minutes": 140,
  "classification": "B",
  "release_date": "2026-07-31",
  "poster_url": "https://image.tmdb.org/t/p/w1280/4eb4y74sZlJ60LFA1LqZvRuNU1o.jpg",
  "trailer_url": "1UNIRI7tUrg"
}'

echo "Spider-Man: Brand New Day enviado"

# Street Fighter
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Street Fighter",
  "director": "Kitao Sakurai",
  "synopsis": "Los luchadores más poderosos del mundo se enfrentan en un torneo que decidirá el destino de la humanidad.",
  "genres": "accion,aventura,videojuego",
  "duration_minutes": 125,
  "classification": "B15",
  "release_date": "2026-03-20",
  "poster_url": "https://images.hdqwalls.com/download/street-fighter-movie-2026-movie-2x-3840x2400.jpg",
  "trailer_url": "Xt4X4FvXk2A"
}'

echo "Street Fighter enviado"

# Spider-Noir
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Spider-Noir",
  "director": "Harry Bradbeer",
  "synopsis": "Un envejecido investigador privado en una Nueva York alternativa de los años 30 enfrenta su pasado como el único superhéroe de la ciudad.",
  "genres": "accion,crimen,sci_fi,noir",
  "duration_minutes": 50,
  "classification": "B15",
  "release_date": "2026-01-01",
  "poster_url": "https://image.tmdb.org/t/p/w1280/cRAzL6mmdM6Q6UuQgc335UMgcfd.jpg",
  "trailer_url": "HDXosdQkwcw"
}'

echo "Spider-Noir enviado"

# Resident Evil
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Resident Evil",
  "director": "Zach Cregger",
  "synopsis": "Un nuevo brote biológico desata el caos mientras un grupo de sobrevivientes intenta escapar de criaturas mutadas y conspiraciones corporativas.",
  "genres": "terror,accion,sci_fi",
  "duration_minutes": 115,
  "classification": "C",
  "release_date": "2026-09-18",
  "poster_url": "https://cdn.cinematerial.com/p/297x/bqwgcqfg/resident-evil-poster-md.jpg?v=1756641558",
  "trailer_url": "SJPu1spHqfk"
}'

echo "Resident Evil enviado"

# Scary Movie 6
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Scary Movie 6",
  "director": "Marlon Wayans",
  "synopsis": "Una nueva ola de parodias lleva a un grupo de personajes a enfrentarse a situaciones absurdas inspiradas en películas de terror modernas.",
  "genres": "comedia,terror",
  "duration_minutes": 98,
  "classification": "C",
  "release_date": "2026-06-12",
  "poster_url": "https://image.tmdb.org/t/p/w1280/iYQnvP1DrgSaoSbYPuNCPr3TRqk.jpg",
  "trailer_url": "Zszr3BTpqPE"
}'

echo "Scary Movie 6 enviado"

# Supergirl
curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Supergirl",
  "director": "Craig Gillespie",
  "synopsis": "Kara Zor-El emprende un viaje por el universo mientras intenta encontrar su lugar como heroína en un mundo lleno de amenazas.",
  "genres": "accion,aventura,sci_fi,fantasia",
  "duration_minutes": 135,
  "classification": "B",
  "release_date": "2026-06-26",
  "poster_url": "https://tse2.mm.bing.net/th/id/OIP.9DyrxhAsCsH08oj8bQFhUQHaJX?cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3",
  "trailer_url": "s1-pfiVMKAs"
}'

echo "Supergirl enviado"

echo "Todas las peliculas fueron enviadas"