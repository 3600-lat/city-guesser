# Credits:
# - Mike Bostock, https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c
#   parts 1, 2, 3 and 4.
# - Carolina Bigonha, https://github.com/carolinabigonha/br-atlas/
# - Natural Earth Data, https://www.naturalearthdata.com/downloads/10m-cultural-vectors/

# All countries
COUNTRIES = \
	BO AR UY

DATAFILE = ne_10m_populated_places_simple
ZIP = download/${DATAFILE}.zip
SHP = tmp/shp/${DATAFILE}.shp
NDJSON = tmp/ndjson/${DATAFILE}.ndjson
PLACES = $(addprefix tmp/places/,$(addsuffix .json,$(COUNTRIES)))
PUBLIC_COUNTRIES = $(addprefix public/,$(addsuffix /,$(COUNTRIES)))

all: ${PUBLIC_COUNTRIES} public/index.html

# Install dependencies
node_modules:
	npm install

# .SECONDARY with no dependencies marks all file targets mentioned in the makefile as secondary.
.SECONDARY:

# Downloads the Natural Earth file zip file
# https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
${ZIP}:
	mkdir -p $(dir $@)
	curl -L 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/${DATAFILE}.zip' -o $@.download
	mv $@.download $@

# Extracts the file
${SHP}: ${ZIP}
	rm -rf $(dir $@)
	mkdir -p $(dir $@)
	unzip -d $(dir $@) $<

# Convert to GeoJSON
${NDJSON}: ${SHP} node_modules
	mkdir -p $(dir $@)
	npx shp2json --encoding "utf-8" -n $< > $@

# Filter by country
tmp/places/%.json: ${NDJSON}
	mkdir -p $(dir $@)
	npx ndjson-filter 'd.properties.iso_a2 === "$*"' < $< | npx ndjson-reduce | npx ndjson-map '{type: "FeatureCollection", features: d}' > $@

# Copy every country to its own public directory, with the HTML and JS files
public/%/: tmp/places/%.json src
	mkdir -p $@
	cp $< $@places.json
	cp src/country/* $@

public/index.html:
	cp src/index.html $@


# -- Clean

# Clean tmp
clean-tmp:
	rm -rf tmp

# Clean download
clean-download:
	rm -rf download

# Clean public
clean-public:
	rm -rf public

# Clean everything but the downloaded data
clean: clean-tmp clean-public

# Clean everything
clean-all: clean clean-download
