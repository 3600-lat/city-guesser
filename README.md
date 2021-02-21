### city-guesser

City-Guesser is a map-based quiz game designed to test one's knowledge of urban form and network structure of cities around the world.

Play here: http://jamaps.github.io/city-guesser/index.html

The game is simple. You are given an unlabeled street map, and you have to guess which city it represents. If you guess correctly, you move onto the next round. Each round gets progressively more difficult as more obscure cities are added into the choice set. A level counter and game score is updated each time you guess correctly. If you guess wrong, you have to restart, but a high score is saved for future reference.

The data comes from Natural Earth (populated places) and OpenStreetMap (base map), and the tiles come from MapBox.

## Install

To create the data and instances by country:

- edit \`countries\` in [Makefile](./Makefile)
- run

  ```
  make clean; make;
  ```

## TODO

- list of countries as a config file with:
  - use a custom style for every country, based on the flag or country style?
  - localize
- just for South America: splash screen to select the country, or: one country per URL subdirectory? -> one geojson per "area / filter"
- fix the init + state management
- remove console messages

## Done

- shp encoding
- reproductible creation of geojson
- list of countries as a config file with:
  - filter geojson based on a list of countries
