#!/bin/bash

URL="http://localhost:80/api/movies"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Interstellar",
  "director": "Christopher Nolan",
  "synopsis": "Un grupo de exploradores viaja a través de un agujero de gusano para salvar a la humanidad.",
  "genres": "sci_fi,drama,aventura",
  "duration_minutes": 169,
  "classification": "B",
  "release_date": "2014-11-07",
  "poster_url": "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "trailer_url": "zSWdZVtXT7E"
}'

echo "Interstellar enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "The Batman",
  "director": "Matt Reeves",
  "synopsis": "Batman investiga una serie de asesinatos en Gotham.",
  "genres": "accion,crimen,thriller,drama",
  "duration_minutes": 176,
  "classification": "B15",
  "release_date": "2022-03-04",
  "poster_url": "https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  "trailer_url": "mqqft2x_Aa4"
}'

echo "The Batman enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Toy Story",
  "director": "John Lasseter",
  "synopsis": "Los juguetes cobran vida cuando los humanos no miran.",
  "genres": "animada,aventura,comedia",
  "duration_minutes": 81,
  "classification": "A",
  "release_date": "1995-11-22",
  "poster_url": "https://image.tmdb.org/t/p/original/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  "trailer_url": "KYz2wyBy3kc"
}'

echo "Toy Story enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Joker",
  "director": "Todd Phillips",
  "synopsis": "Un hombre marginado se convierte en el Joker.",
  "genres": "drama,crimen,thriller",
  "duration_minutes": 122,
  "classification": "C",
  "release_date": "2019-10-04",
  "poster_url": "https://image.tmdb.org/t/p/original/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  "trailer_url": "zAGVQLHvwOY"
}'

echo "Joker enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Avatar",
  "director": "James Cameron",
  "synopsis": "Un marine en Pandora queda atrapado entre dos mundos.",
  "genres": "sci_fi,aventura,accion",
  "duration_minutes": 162,
  "classification": "B",
  "release_date": "2009-12-18",
  "poster_url": "https://image.tmdb.org/t/p/original/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  "trailer_url": "5PSNL1qE6VY"
}'

echo "Avatar enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Spider-Man: No Way Home",
  "director": "Jon Watts",
  "synopsis": "Peter Parker enfrenta las consecuencias de revelar su identidad.",
  "genres": "accion,aventura,fantasia",
  "duration_minutes": 148,
  "classification": "B",
  "release_date": "2021-12-17",
  "poster_url": "https://image.tmdb.org/t/p/original/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  "trailer_url": "JfVOs4VSpmA"
}'

echo "Spider-Man enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Coco",
  "director": "Lee Unkrich",
  "synopsis": "Un niño viaja al mundo de los muertos para descubrir su historia familiar.",
  "genres": "animada,aventura,drama",
  "duration_minutes": 105,
  "classification": "A",
  "release_date": "2017-11-22",
  "poster_url": "https://image.tmdb.org/t/p/original/eKi8dIrr8voobbaGzDpe8w0PVbC.jpg",
  "trailer_url": "Ga6RYejo6Hk"
}'

echo "Coco enviado"

curl -X POST "$URL" -H "Content-Type: application/json" -d '{
  "title": "Dune",
  "director": "Denis Villeneuve",
  "synopsis": "Un joven noble protege el recurso más valioso del universo.",
  "genres": "sci_fi,drama,aventura",
  "duration_minutes": 155,
  "classification": "B15",
  "release_date": "2021-10-22",
  "poster_url": "https://image.tmdb.org/t/p/original/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  "trailer_url": "n9xhJrPXop4"
}'

echo "Dune enviado"
